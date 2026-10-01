# FlowPay — Digital Wallet App

FlowPay is a complete **HTML, CSS, and JavaScript-only** digital-wallet project designed for BTech review. It runs directly in a browser and uses Local Storage instead of a backend or database.

## 1. Problem statement

Digital payments are convenient, but people need a simple way to keep a balance, send money, pay recurring bills, track spending, and maintain a budget. FlowPay provides a single web-based wallet where users can manage these activities while administrators monitor users, transactions, and bill options.

## 2. Business system and modules

### User module

- Signup, login, session, and logout
- Wallet balance and demo wallet top-up
- Peer-to-peer transfer to another registered user
- QR-payment simulation for merchant payments
- Bill payment
- Searchable transaction history
- Monthly budget planner based on spending

### Admin module

- Separate admin login and dashboard
- View registered wallet users and their balances
- View/search all transactions
- Add bills and activate/deactivate bills
- View wallet activity statistics

## 3–7. Implementation summary

- Built with **only HTML5, CSS3, and vanilla JavaScript**—no backend, database, frameworks, or APIs.
- CSS Grid and Flexbox create the responsive authentication layout, dashboard, cards, forms, navigation, and tables.
- Users, wallet balances, bills, budgets, transactions, and login session are maintained in browser **Local Storage**.
- JavaScript renders role-specific navigation and redirects users logically after login and actions.
- Validation prevents insufficient-balance payments, duplicate accounts, self-transfers, and transfers to unregistered users.

## How to run

Open `index.html` in a current browser. Create two User accounts to demonstrate person-to-person transfer. Use **Add demo funds** in the user dashboard before making a payment.

### Administrator demo access

| Email | Password |
|---|---|
| `chakradharmandadapu@gmail.com` | `200809` |

## Review demonstration flow

1. Explain the problem statement, then create a User wallet.
2. Add demo funds and make a QR merchant payment or pay a bill.
3. Create a second User, then transfer money using that User's email.
4. Show the transaction history search and the monthly budget planner.
5. Log in as Admin; show users, transactions, dashboard totals, and bill management.

## 8. GitHub push steps

Create an empty GitHub repository, then from this folder run:

```bash
git init
git add index.html style.css app.js README.md
git commit -m "Build FlowPay digital wallet app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/digital-wallet-app.git
git push -u origin main
```

## 9. Points to explain during review

- Local Storage replaces a database for this front-end-only academic project.
- The active user's data is held in a session object; role determines the dashboard/navigation shown.
- A transfer updates sender and recipient balances and creates two corresponding transactions.
- The QR payment is intentionally simulated because actual QR camera/bank integration would require a backend and external payment gateway, which are outside the permitted technologies.
