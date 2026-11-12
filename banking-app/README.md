# NMIT Bank — Node.js Banking App (DevOps assignment)

Simple banking app. **No database**: every account is a `.txt` file and every login is a `.txt` file.

## Run it

```bash
npm install
npm start          # http://localhost:3000
npm test           # smoke tests (uses a temp data folder)
```

Env vars: `PORT` (default 3000), `DATA_DIR` (default `./data`) — handy later for Docker volumes.

## Project layout

```
banking-app/
├── server.js            # Express routes (REST API + serves the UI)
├── src/
│   ├── storage.js       # reads/writes the .txt files
│   └── auth.js          # scrypt password hashing + sessions
├── public/index.html    # dark glassmorphism UI
├── test/smoke.test.js   # end-to-end test (node:test, no extra deps)
└── data/
    ├── accounts/        # ACC1000001.txt, ACC1000002.txt, ...
    └── logins/          # ankit.txt, bob.txt, ...
```

## File formats

`data/accounts/ACC1000001.txt`
```
accountNumber: ACC1000001
name: Ankit
email: ankit@example.com
username: ankit
balance: 1500.00
createdAt: 2026-11-12T13:54:30.212Z
--- TRANSACTIONS ---
2026-11-12T13:54:30.212Z|OPEN|1000.00|1000.00|Account opened
2026-11-12T13:54:30.363Z|DEPOSIT|500.00|1500.00|Cash deposit
```
Transaction line = `time|type|amount|balanceAfter|note`

`data/logins/ankit.txt`
```
username: ankit
accountNumber: ACC1000001
salt: <random hex>
passwordHash: <scrypt hash, never the plain password>
createdAt: ...
lastLogin: ...
failedAttempts: 0
```

## API

| Method | Route | Auth | Body |
|---|---|---|---|
| GET | `/health` | no | — |
| POST | `/api/register` | no | `name, email, username, password, initialDeposit?` |
| POST | `/api/login` | no | `username, password` → returns `token` |
| POST | `/api/logout` | yes | — |
| GET | `/api/account` | yes | — |
| GET | `/api/transactions` | yes | — |
| POST | `/api/deposit` | yes | `amount` |
| POST | `/api/withdraw` | yes | `amount` |
| POST | `/api/transfer` | yes | `toAccount, amount, note?` |

Auth = header `Authorization: Bearer <token>`.

## Security notes

- Passwords are salted + hashed with scrypt (Node built-in), compared in constant time.
- Account locks after 5 failed logins.
- Usernames / account numbers are regex-validated, so `../` path tricks can't escape `data/`.
- Money is handled in integer paise to avoid floating-point errors.
- Files are written atomically (temp file + rename).
- `.gitignore` keeps real account/login files out of git.

## Known limits (fine for an assignment)

- Sessions are in memory, so a restart logs everyone out.
- Sync file I/O and one process only; for several instances you'd move to a real DB.
- Account lock needs a manual edit of `failedAttempts` in the login file to reset.

## TODO (next DevOps step)

- [ ] Dockerfile + `.dockerignore` (mount `DATA_DIR` as a volume)
- [ ] CI pipeline running `npm test`
