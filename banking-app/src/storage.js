// Storage layer: every account = one .txt file, every login = one .txt file.
//
//   data/accounts/ACC1000001.txt   -> account details + transaction history
//   data/logins/ankit.txt          -> login info (salted password hash, never plain text)
//
// Everything is synchronous on purpose: Node is single-threaded, so sync file
// calls can't interleave and corrupt a balance. Fine for an assignment-sized app.

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const ACCOUNTS_DIR = path.join(DATA_DIR, 'accounts');
const LOGINS_DIR = path.join(DATA_DIR, 'logins');
const TXN_MARKER = '--- TRANSACTIONS ---';

fs.mkdirSync(ACCOUNTS_DIR, { recursive: true });
fs.mkdirSync(LOGINS_DIR, { recursive: true });

// ---------- validation (also blocks path traversal like "../../etc") ----------
const ACCOUNT_RE = /^ACC\d{7}$/;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

const isValidAccountNo = (v) => typeof v === 'string' && ACCOUNT_RE.test(v);
const isValidUsername = (v) => typeof v === 'string' && USERNAME_RE.test(v);

// ---------- money helpers (integer paise, avoids 0.1 + 0.2 float bugs) ----------
const toPaise = (rupees) => Math.round(Number(rupees) * 100);
const fromPaise = (paise) => (paise / 100).toFixed(2);

// ---------- small key: value file format ----------
function writeAtomic(file, content) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, file); // rename is atomic, so a crash never leaves a half-written file
}

function parseKeyValues(lines) {
  const obj = {};
  for (const line of lines) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    obj[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return obj;
}

// ---------- accounts ----------
const accountPath = (no) => path.join(ACCOUNTS_DIR, `${no}.txt`);

function accountExists(no) {
  return isValidAccountNo(no) && fs.existsSync(accountPath(no));
}

function nextAccountNumber() {
  const nums = fs
    .readdirSync(ACCOUNTS_DIR)
    .filter((f) => /^ACC\d{7}\.txt$/.test(f))
    .map((f) => parseInt(f.slice(3, 10), 10));
  const next = nums.length ? Math.max(...nums) + 1 : 1000001;
  return `ACC${next}`;
}

function readAccount(no) {
  if (!accountExists(no)) return null;
  const raw = fs.readFileSync(accountPath(no), 'utf8');
  const [head, tail = ''] = raw.split(TXN_MARKER);
  const fields = parseKeyValues(head.split('\n'));

  const transactions = tail
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [time, type, amount, balanceAfter, note = ''] = l.split('|');
      return { time, type, amount, balanceAfter, note };
    });

  return {
    accountNumber: fields.accountNumber,
    name: fields.name,
    email: fields.email,
    username: fields.username,
    balancePaise: toPaise(fields.balance),
    createdAt: fields.createdAt,
    transactions,
  };
}

function saveAccount(acc) {
  const head = [
    `accountNumber: ${acc.accountNumber}`,
    `name: ${acc.name}`,
    `email: ${acc.email}`,
    `username: ${acc.username}`,
    `balance: ${fromPaise(acc.balancePaise)}`,
    `createdAt: ${acc.createdAt}`,
  ].join('\n');

  const txns = acc.transactions
    .map((t) => [t.time, t.type, t.amount, t.balanceAfter, t.note].join('|'))
    .join('\n');

  writeAtomic(accountPath(acc.accountNumber), `${head}\n${TXN_MARKER}\n${txns}\n`);
}

function addTransaction(acc, type, paise, note = '') {
  acc.transactions.push({
    time: new Date().toISOString(),
    type,
    amount: fromPaise(paise),
    balanceAfter: fromPaise(acc.balancePaise),
    note: note.replace(/[|\n\r]/g, ' ').slice(0, 80), // keep the txt format safe
  });
}

// ---------- logins ----------
const loginPath = (username) => path.join(LOGINS_DIR, `${username}.txt`);

function loginExists(username) {
  return isValidUsername(username) && fs.existsSync(loginPath(username));
}

function readLogin(username) {
  if (!loginExists(username)) return null;
  const raw = fs.readFileSync(loginPath(username), 'utf8');
  return parseKeyValues(raw.split('\n'));
}

function saveLogin(login) {
  const content = [
    `username: ${login.username}`,
    `accountNumber: ${login.accountNumber}`,
    `salt: ${login.salt}`,
    `passwordHash: ${login.passwordHash}`,
    `createdAt: ${login.createdAt}`,
    `lastLogin: ${login.lastLogin || 'never'}`,
    `failedAttempts: ${login.failedAttempts || 0}`,
  ].join('\n');
  writeAtomic(loginPath(login.username), `${content}\n`);
}

module.exports = {
  DATA_DIR,
  isValidAccountNo,
  isValidUsername,
  toPaise,
  fromPaise,
  accountExists,
  nextAccountNumber,
  readAccount,
  saveAccount,
  addTransaction,
  loginExists,
  readLogin,
  saveLogin,
};
