// Zero-dependency smoke test (uses Node's built-in test runner + fetch).
// Runs against a throwaway data folder, so it never touches real account files.
// Run with:  npm test

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'bank-test-'));
const app = require('../server');

let server, base;
test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => {
  server.close();
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
});

const call = async (p, method = 'GET', body, token) => {
  const res = await fetch(base + p, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};

test('full banking flow', async () => {
  // register two users
  let r = await call('/api/register', 'POST', { name: 'Ankit', email: 'a@x.com', username: 'ankit', password: 'secret1', initialDeposit: 1000 });
  assert.strictEqual(r.status, 201);
  const accA = r.data.account.accountNumber;
  r = await call('/api/register', 'POST', { name: 'Bob', email: 'b@x.com', username: 'bob', password: 'secret2' });
  const accB = r.data.account.accountNumber;
  assert.notStrictEqual(accA, accB);

  // txt files exist
  const dir = process.env.DATA_DIR;
  assert.ok(fs.existsSync(path.join(dir, 'accounts', `${accA}.txt`)));
  assert.ok(fs.existsSync(path.join(dir, 'logins', 'ankit.txt')));
  assert.ok(!fs.readFileSync(path.join(dir, 'logins', 'ankit.txt'), 'utf8').includes('secret1'), 'password must not be stored in plain text');

  // duplicate username + bad login
  assert.strictEqual((await call('/api/register', 'POST', { name: 'Dup User', email: 'x@x.com', username: 'ankit', password: 'secret1' })).status, 409);
  assert.strictEqual((await call('/api/login', 'POST', { username: 'ankit', password: 'wrong' })).status, 401);

  // login + auth required
  assert.strictEqual((await call('/api/account')).status, 401);
  const { data: login } = await call('/api/login', 'POST', { username: 'ankit', password: 'secret1' });
  const t = login.token;

  // money operations
  assert.strictEqual((await call('/api/deposit', 'POST', { amount: 250.5 }, t)).data.balance, '1250.50');
  assert.strictEqual((await call('/api/withdraw', 'POST', { amount: 50.25 }, t)).data.balance, '1200.25');
  assert.strictEqual((await call('/api/withdraw', 'POST', { amount: 99999 }, t)).status, 400);
  assert.strictEqual((await call('/api/deposit', 'POST', { amount: -5 }, t)).status, 400);
  assert.strictEqual((await call('/api/transfer', 'POST', { toAccount: accB, amount: 200 }, t)).data.balance, '1000.25');
  assert.strictEqual((await call('/api/transfer', 'POST', { toAccount: '../../etc/passwd', amount: 1 }, t)).status, 404);

  // recipient got the money
  const { data: bLogin } = await call('/api/login', 'POST', { username: 'bob', password: 'secret2' });
  assert.strictEqual((await call('/api/account', 'GET', null, bLogin.token)).data.balance, '200.00');

  // history + logout
  // OPEN, DEPOSIT, WITHDRAW, TRANSFER_OUT (rejected operations are not logged)
  assert.strictEqual((await call('/api/transactions', 'GET', null, t)).data.transactions.length, 4);
  assert.strictEqual((await call('/api/logout', 'POST', null, t)).status, 200);
  assert.strictEqual((await call('/api/account', 'GET', null, t)).status, 401);
});

test('account locks after 5 wrong passwords', async () => {
  await call('/api/register', 'POST', { name: 'Eve', email: 'e@x.com', username: 'eve', password: 'goodpass' });
  for (let i = 0; i < 5; i++) await call('/api/login', 'POST', { username: 'eve', password: 'bad' });
  assert.strictEqual((await call('/api/login', 'POST', { username: 'eve', password: 'goodpass' })).status, 423);
});
