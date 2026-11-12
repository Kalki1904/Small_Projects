const express = require('express');
const path = require('path');
const store = require('./src/storage');
const auth = require('./src/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------
const MAX_AMOUNT_PAISE = 1_000_000_00; // ₹10,00,000 per transaction

function parseAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const paise = store.toPaise(n);
  if (paise < 1 || paise > MAX_AMOUNT_PAISE) return null;
  return paise;
}

const publicAccount = (acc) => ({
  accountNumber: acc.accountNumber,
  name: acc.name,
  email: acc.email,
  username: acc.username,
  balance: store.fromPaise(acc.balancePaise),
  createdAt: acc.createdAt,
});

// ---------- health check (handy for Docker / CI later) ----------
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ---------- register ----------
app.post('/api/register', (req, res) => {
  const { name, email, username, password, initialDeposit = 0 } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2)
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ error: 'Enter a valid email' });
  if (!store.isValidUsername(username))
    return res.status(400).json({ error: 'Username: 3-20 chars, lowercase letters, digits, underscore only' });
  if (typeof password !== 'string' || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (store.loginExists(username)) return res.status(409).json({ error: 'Username already taken' });

  const openingPaise = Number(initialDeposit) > 0 ? parseAmount(initialDeposit) : 0;
  if (openingPaise === null) return res.status(400).json({ error: 'Invalid initial deposit' });

  const accountNumber = store.nextAccountNumber();
  const now = new Date().toISOString();

  const account = {
    accountNumber,
    name: name.trim().replace(/[\n\r]/g, ' '),
    email: email.trim(),
    username,
    balancePaise: openingPaise,
    createdAt: now,
    transactions: [],
  };
  store.addTransaction(account, 'OPEN', openingPaise, 'Account opened');
  store.saveAccount(account);

  const { salt, hash } = auth.hashPassword(password);
  store.saveLogin({ username, accountNumber, salt, passwordHash: hash, createdAt: now });

  res.status(201).json({ message: 'Account created', account: publicAccount(account) });
});

// ---------- login / logout ----------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const generic = { error: 'Invalid username or password' };

  const login = store.isValidUsername(username) ? store.readLogin(username) : null;
  if (!login || typeof password !== 'string') return res.status(401).json(generic);

  const failed = parseInt(login.failedAttempts || '0', 10);
  if (failed >= auth.MAX_FAILED_ATTEMPTS)
    return res.status(423).json({ error: 'Account locked after too many failed attempts' });

  if (!auth.verifyPassword(password, login.salt, login.passwordHash)) {
    store.saveLogin({ ...login, failedAttempts: failed + 1 });
    return res.status(401).json(generic);
  }

  store.saveLogin({ ...login, failedAttempts: 0, lastLogin: new Date().toISOString() });
  const token = auth.createSession(login.username, login.accountNumber);
  res.json({ message: 'Logged in', token, accountNumber: login.accountNumber });
});

app.post('/api/logout', auth.requireAuth, (req, res) => {
  auth.destroySession(req.token);
  res.json({ message: 'Logged out' });
});

// ---------- account ----------
app.get('/api/account', auth.requireAuth, (req, res) => {
  const acc = store.readAccount(req.session.accountNumber);
  if (!acc) return res.status(404).json({ error: 'Account not found' });
  res.json(publicAccount(acc));
});

app.get('/api/transactions', auth.requireAuth, (req, res) => {
  const acc = store.readAccount(req.session.accountNumber);
  if (!acc) return res.status(404).json({ error: 'Account not found' });
  res.json({ transactions: [...acc.transactions].reverse() });
});

app.post('/api/deposit', auth.requireAuth, (req, res) => {
  const paise = parseAmount(req.body && req.body.amount);
  if (paise === null) return res.status(400).json({ error: 'Enter a valid amount (max ₹10,00,000)' });

  const acc = store.readAccount(req.session.accountNumber);
  acc.balancePaise += paise;
  store.addTransaction(acc, 'DEPOSIT', paise, 'Cash deposit');
  store.saveAccount(acc);
  res.json({ message: 'Deposit successful', balance: store.fromPaise(acc.balancePaise) });
});

app.post('/api/withdraw', auth.requireAuth, (req, res) => {
  const paise = parseAmount(req.body && req.body.amount);
  if (paise === null) return res.status(400).json({ error: 'Enter a valid amount (max ₹10,00,000)' });

  const acc = store.readAccount(req.session.accountNumber);
  if (paise > acc.balancePaise) return res.status(400).json({ error: 'Insufficient balance' });

  acc.balancePaise -= paise;
  store.addTransaction(acc, 'WITHDRAW', paise, 'Cash withdrawal');
  store.saveAccount(acc);
  res.json({ message: 'Withdrawal successful', balance: store.fromPaise(acc.balancePaise) });
});

app.post('/api/transfer', auth.requireAuth, (req, res) => {
  const { toAccount, amount, note = '' } = req.body || {};
  const paise = parseAmount(amount);
  if (paise === null) return res.status(400).json({ error: 'Enter a valid amount (max ₹10,00,000)' });
  if (!store.accountExists(toAccount)) return res.status(404).json({ error: 'Recipient account not found' });
  if (toAccount === req.session.accountNumber)
    return res.status(400).json({ error: 'Cannot transfer to your own account' });

  const from = store.readAccount(req.session.accountNumber);
  if (paise > from.balancePaise) return res.status(400).json({ error: 'Insufficient balance' });
  const to = store.readAccount(toAccount);

  from.balancePaise -= paise;
  to.balancePaise += paise;
  store.addTransaction(from, 'TRANSFER_OUT', paise, `To ${to.accountNumber} ${note}`.trim());
  store.addTransaction(to, 'TRANSFER_IN', paise, `From ${from.accountNumber} ${note}`.trim());
  store.saveAccount(from);
  store.saveAccount(to);

  res.json({ message: 'Transfer successful', balance: store.fromPaise(from.balancePaise) });
});

// ---------- fallbacks ----------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  res.status(500).json({ error: 'Something went wrong' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Banking app running on http://localhost:${PORT} (data: ${store.DATA_DIR})`));
}

module.exports = app;
