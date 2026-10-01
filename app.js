const KEY = 'flowpay_wallet_v1';

let state = {
    page: 'dashboard',
    search: ''
};

function init() {
    if (localStorage.getItem(KEY)) {
        let d = JSON.parse(localStorage.getItem(KEY));
        let a = d.users.find(u => u.id === 'admin');

        if (a) {
            a.email = 'chakradharmandadapu@gmail.com';
            a.password = '200809';

            localStorage.setItem(KEY, JSON.stringify(d));
        }

        return;
    }

    localStorage.setItem(
        KEY,
        JSON.stringify({
            users: [
                {
                    id: 'admin',
                    name: 'FlowPay Admin',
                    email: 'chakradharmandadapu@gmail.com',
                    password: '200809',
                    phone: '0000000000',
                    role: 'admin',
                    balance: 0
                }
            ],

            transactions: [],

            bills: [
                {
                    id: 'b1',
                    name: 'Electricity Bill',
                    category: 'Utilities',
                    amount: 850,
                    due: '2026-10-05',
                    active: true
                },
                {
                    id: 'b2',
                    name: 'Mobile Recharge',
                    category: 'Mobile',
                    amount: 299,
                    due: '2026-10-01',
                    active: true
                }
            ],

            budgets: []
        })
    );
}

const db = () =>
    JSON.parse(localStorage.getItem(KEY));

const save = d =>
    localStorage.setItem(KEY, JSON.stringify(d));

const me = () =>
    JSON.parse(
        localStorage.getItem('flowpay_session') || 'null'
    );

const esc = s =>
    String(s || '').replace(
        /[&<>"']/g,
        x => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[x])
    );

const money = n =>
    '₹' +
    Number(n).toLocaleString('en-IN', {
        minimumFractionDigits: 2
    });


function toast(s) {
    let t = document.getElementById('toast');

    t.textContent = s;
    t.classList.add('show');

    setTimeout(() => {
        t.classList.remove('show');
    }, 2600);
}


function auth(mode) {
    document
        .getElementById('loginForm')
        .classList.toggle('hidden', mode === 'signup');

    document
        .getElementById('signupForm')
        .classList.toggle('hidden', mode !== 'signup');

    document.getElementById('authTitle').textContent =
        mode === 'signup'
            ? 'Create your wallet'
            : 'Sign in to your wallet';

    document.getElementById('authText').textContent =
        mode === 'signup'
            ? 'Start managing your money in one place.'
            : 'Your money overview is waiting.';
}


function render() {
    let u = me();

    document
        .getElementById('auth')
        .classList.toggle('hidden', !!u);

    document
        .getElementById('app')
        .classList.toggle('hidden', !u);

    if (!u) {
        return;
    }

    let admin = u.role === 'admin';

    document.getElementById('avatar').textContent =
        u.name[0];

    document.getElementById('sideName').textContent =
        u.name;

    document.getElementById('sideRole').textContent =
        admin
            ? 'Wallet administrator'
            : 'Wallet user';

    document.getElementById('today').textContent =
        new Date().toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });

    let nav = admin
        ? [
            ['dashboard', '▦', 'Overview'],
            ['users', '♧', 'Wallet users'],
            ['transactions', '⇄', 'Transactions'],
            ['bills', '▤', 'Bill payments']
        ]
        : [
            ['dashboard', '▦', 'Dashboard'],
            ['send', '⇄', 'Send money'],
            ['transactions', '◷', 'Transactions'],
            ['bills', '▤', 'Pay bills'],
            ['budget', '◔', 'Budget planner']
        ];

    document.getElementById('nav').innerHTML =
        nav
            .map(
                n =>
                    `<button data-page="${n[0]}" class="${state.page === n[0]
                        ? 'active'
                        : ''
                    }">
                        <span>${n[1]}</span>
                        ${n[2]}
                    </button>`
            )
            .join('');

    let titles = {
        dashboard: 'Dashboard',
        send: 'Send money',
        transactions: 'Transaction history',
        bills: 'Bill payments',
        budget: 'Budget planner',
        users: 'Wallet users'
    };

    document.getElementById('title').textContent =
        titles[state.page];

    document.getElementById('kicker').textContent =
        admin
            ? 'ADMIN PORTAL'
            : 'MY WALLET';

    document.getElementById('content').innerHTML =
        admin
            ? adminView()
            : userView();
}


function txRow(t) {
    return `
        <div class="tx">
            <div class="tx-icon">
                ${t.type === 'credit' ? '↓' : '↑'}
            </div>

            <div>
                <b>${esc(t.title)}</b>
                <small>
                    ${t.date} · ${esc(t.category)}
                </small>
            </div>

            <div class="amount ${t.type === 'credit'
            ? 'in'
            : 'out'
        }">
                ${t.type === 'credit' ? '+' : '-'}${money(t.amount)}
            </div>
        </div>
    `;
}


function myTx() {
    let u = me();

    return db()
        .transactions
        .filter(t => t.userId === u.id);
}


function userView() {
    let u = me();
    let d = db();
    let tx = myTx();

    if (state.page === 'dashboard') {
        return `
            <div class="content">

                <div class="welcome">
                    <div>
                        <h1>
                            Hello, ${esc(u.name.split(' ')[0])}.
                        </h1>

                        <p>
                            Your money, clearly in view.
                        </p>
                    </div>
                </div>

                <section class="balance">
                    <small>AVAILABLE BALANCE</small>

                    <b>
                        ${money(u.balance)}
                    </b>

                    <span>
                        ● Wallet active
                    </span>
                </section>

                <div class="quick-grid">

                    <button class="quick" data-action="send">
                        <i>⇄</i>
                        Send money
                    </button>

                    <button class="quick" data-action="qr">
                        <i>▣</i>
                        QR payment
                    </button>

                    <button class="quick" data-action="add">
                        <i>＋</i>
                        Add demo funds
                    </button>

                    <button class="quick" data-page="bills">
                        <i>▤</i>
                        Pay bills
                    </button>

                </div>

                <div class="section-title">
                    <h3>Recent activity</h3>

                    <button
                        class="link"
                        data-page="transactions"
                    >
                        View all →
                    </button>
                </div>

                <div class="card">
                    ${
                        tx.length
                            ? tx
                                .slice(-5)
                                .reverse()
                                .map(txRow)
                                .join('')
                            : `
                                <div class="empty">
                                    No transactions yet.
                                    Add funds to start your demo.
                                </div>
                            `
                    }
                </div>

            </div>
        `;
    }

    if (state.page === 'send') {
        return `
            <div class="content">

                <div class="card">

                    <h3>
                        Transfer money
                    </h3>

                    <p class="muted">
                        Send money instantly to another
                        registered FlowPay user.
                    </p>

                    ${transferForm()}

                </div>

            </div>
        `;
    }

    if (state.page === 'transactions') {
        return transactions(tx, false);
    }

    if (state.page === 'bills') {
        return bills(false);
    }

    return budget();
}


function transferForm() {
    return `
        <form id="transferForm">

            <div class="form-grid">

                <label>
                    Recipient email

                    <input
                        name="recipient"
                        type="email"
                        required
                        placeholder="recipient@example.com"
                    >
                </label>

                <label>
                    Amount (₹)

                    <input
                        name="amount"
                        type="number"
                        min="1"
                        required
                        placeholder="0"
                    >
                </label>

                <label class="full">
                    Note

                    <input
                        name="note"
                        required
                        placeholder="e.g. Dinner share"
                    >
                </label>

            </div>

            <div class="actions">

                <button class="primary">
                    Send money
                </button>

            </div>

        </form>
    `;
}


function transactions(list, admin) {
    let all = list.filter(
        t =>
            !state.search ||
            `${t.title} ${t.category}`
                .toLowerCase()
                .includes(state.search.toLowerCase())
    );

    return `
        <div class="content">

            <div class="toolbar">

                <input
                    class="search"
                    data-search
                    placeholder="Search transactions"
                    value="${esc(state.search)}"
                >

                ${
                    !admin
                        ? `
                            <button
                                class="primary"
                                data-action="send"
                            >
                                Send money
                            </button>
                        `
                        : ''
                }

            </div>

            <div class="card">

                ${
                    all.length
                        ? all
                            .slice()
                            .reverse()
                            .map(txRow)
                            .join('')
                        : `
                            <div class="empty">
                                No transactions match your search.
                            </div>
                        `
                }

            </div>

        </div>
    `;
}


function bills(admin) {
    let d = db();

    return `
        <div class="content">

            <div class="section-title">

                <h3>
                    ${admin ? 'Manage bills' : 'Bills due'}
                </h3>

                ${
                    admin
                        ? `
                            <button
                                class="primary"
                                data-action="addbill"
                            >
                                + Add bill
                            </button>
                        `
                        : ''
                }

            </div>

            <div class="card">

                ${
                    d.bills
                        .map(
                            b => `
                                <div class="tx">

                                    <div class="tx-icon">
                                        ▤
                                    </div>

                                    <div>
                                        <b>
                                            ${esc(b.name)}
                                        </b>

                                        <small>
                                            ${esc(b.category)}
                                            · Due ${b.due}
                                        </small>
                                    </div>

                                    <div>
                                        ${
                                            admin
                                                ? `
                                                    <span class="tag ${b.active
                                                    ? ''
                                                    : 'off'
                                                }">
                                                        ${b.active
                                                    ? 'Active'
                                                    : 'Inactive'
                                                }
                                                    </span>

                                                    <button
                                                        class="link"
                                                        data-togglebill="${b.id}"
                                                    >
                                                        Toggle
                                                    </button>
                                                `
                                                : `
                                                    <button
                                                        class="secondary"
                                                        data-paybill="${b.id}"
                                                    >
                                                        Pay ${money(b.amount)}
                                                    </button>
                                                `
                                        }
                                    </div>

                                </div>
                            `
                        )
                        .join('') ||
                    `
                        <div class="empty">
                            No bills configured.
                        </div>
                    `
                }

            </div>

        </div>
    `;
}


function budget() {
    let d = db();
    let u = me();

    let budget = d.budgets.find(
        b => b.userId === u.id
    );

    let spent = myTx()
        .filter(
            t =>
                t.type === 'debit' &&
                t.category !== 'Transfer'
        )
        .reduce(
            (s, t) => s + t.amount,
            0
        );

    if (!budget) {
        return `
            <div class="content">

                <div class="card">

                    <h3>
                        Set a monthly budget
                    </h3>

                    <p class="muted">
                        Choose a spending limit and use
                        your transaction data to monitor it.
                    </p>

                    <form id="budgetForm">

                        <div class="form-grid">

                            <label>
                                Monthly limit (₹)

                                <input
                                    name="limit"
                                    type="number"
                                    min="1"
                                    required
                                    placeholder="e.g. 10000"
                                >
                            </label>

                            <label>
                                Month

                                <input
                                    name="month"
                                    type="month"
                                    required
                                    value="2026-09"
                                >
                            </label>

                        </div>

                        <div class="actions">

                            <button class="primary">
                                Save budget
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        `;
    }

    let pct = Math.min(
        100,
        Math.round(
            spent / budget.limit * 100
        )
    );

    return `
        <div class="content">

            <div class="card">

                <div class="section-title">

                    <h3>
                        ${budget.month} spending budget
                    </h3>

                    <button
                        class="link"
                        data-action="editbudget"
                    >
                        Edit
                    </button>

                </div>

                <div class="budget">

                    <div class="budget-top">

                        <span>
                            Spent:
                            <b>${money(spent)}</b>
                        </span>

                        <span>
                            Limit:
                            <b>${money(budget.limit)}</b>
                        </span>

                    </div>

                    <div class="bar">
                        <i style="width:${pct}%"></i>
                    </div>

                    <p class="muted">
                        ${pct}% used ·
                        ${money(
                            Math.max(
                                0,
                                budget.limit - spent
                            )
                        )}
                        remaining
                    </p>

                </div>

            </div>

        </div>
    `;
}


function adminView() {
    let d = db();

    if (state.page === 'dashboard') {
        return `
            <div class="content">

                <div class="welcome">

                    <div>

                        <h1>
                            Welcome, Admin.
                        </h1>

                        <p>
                            Overview of FlowPay activity.
                        </p>

                    </div>

                </div>

                <div class="quick-grid">

                    <div class="quick">
                        <i>♧</i>
                        ${d.users.filter(
                            u => u.role === 'user'
                        ).length}
                        <br>
                        <small>Wallet users</small>
                    </div>

                    <div class="quick">
                        <i>⇄</i>
                        ${d.transactions.length}
                        <br>
                        <small>Transactions</small>
                    </div>

                    <div class="quick">
                        <i>₹</i>
                        ${money(
                            d.users
                                .filter(
                                    u => u.role === 'user'
                                )
                                .reduce(
                                    (s, u) =>
                                        s + u.balance,
                                    0
                                )
                        )}
                        <br>
                        <small>User balances</small>
                    </div>

                    <div class="quick">
                        <i>▤</i>
                        ${d.bills.filter(
                            b => b.active
                        ).length}
                        <br>
                        <small>Active bills</small>
                    </div>

                </div>

                <div class="section-title">

                    <h3>
                        Recent transactions
                    </h3>

                    <button
                        class="link"
                        data-page="transactions"
                    >
                        View all →
                    </button>

                </div>

                <div class="card">

                    ${
                        d.transactions.length
                            ? d.transactions
                                .slice(-5)
                                .reverse()
                                .map(txRow)
                                .join('')
                            : `
                                <div class="empty">
                                    No activity yet.
                                </div>
                            `
                    }

                </div>

            </div>
        `;
    }

    if (state.page === 'users') {
        return `
            <div class="content">

                <div class="tablewrap">

                    <table class="table">

                        <thead>

                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Balance</th>
                            </tr>

                        </thead>

                        <tbody>

                            ${
                                d.users
                                    .filter(
                                        u =>
                                            u.role === 'user'
                                    )
                                    .map(
                                        u => `
                                            <tr>

                                                <td>
                                                    ${esc(u.name)}
                                                </td>

                                                <td>
                                                    ${esc(u.email)}
                                                </td>

                                                <td>
                                                    ${esc(u.phone)}
                                                </td>

                                                <td>
                                                    ${money(u.balance)}
                                                </td>

                                            </tr>
                                        `
                                    )
                                    .join('') ||
                                `
                                    <tr>
                                        <td
                                            colspan="4"
                                            class="empty"
                                        >
                                            No users registered.
                                        </td>
                                    </tr>
                                `
                            }

                        </tbody>

                    </table>

                </div>

            </div>
        `;
    }

    if (state.page === 'transactions') {
        return transactions(
            d.transactions,
            true
        );
    }

    return bills(true);
}


function modal(html) {
    document.getElementById(
        'modalContent'
    ).innerHTML = html;

    document
        .getElementById('modal')
        .classList.remove('hidden');
}


function close() {
    document
        .getElementById('modal')
        .classList.add('hidden');
}


function addBillModal() {
    modal(`
        <h2>
            Add bill
        </h2>

        <p>
            Create a bill type that every
            wallet user can pay.
        </p>

        <form id="billForm">

            <div class="form-grid">

                <label>
                    Bill name

                    <input
                        name="name"
                        required
                        placeholder="e.g. Water bill"
                    >
                </label>

                <label>
                    Category

                    <input
                        name="category"
                        required
                        placeholder="Utilities"
                    >
                </label>

                <label>
                    Amount (₹)

                    <input
                        name="amount"
                        type="number"
                        required
                    >
                </label>

                <label>
                    Due date

                    <input
                        name="due"
                        type="date"
                        required
                    >
                </label>

            </div>

            <div class="actions">

                <button
                    type="button"
                    class="secondary"
                    data-close
                >
                    Cancel
                </button>

                <button class="primary">
                    Add bill
                </button>

            </div>

        </form>
    `);
}


function qrModal() {
    modal(`
        <h2>
            QR payment demo
        </h2>

        <p>
            In a real wallet this screen would
            scan a merchant QR. For this
            browser-only project, enter the
            merchant details below.
        </p>

        <form id="qrForm">

            <div class="form-grid">

                <label>
                    Merchant name

                    <input
                        name="merchant"
                        required
                        placeholder="e.g. Campus Cafe"
                    >
                </label>

                <label>
                    Amount (₹)

                    <input
                        name="amount"
                        type="number"
                        min="1"
                        required
                    >
                </label>

            </div>

            <div class="actions">

                <button class="primary">
                    Pay merchant
                </button>

            </div>

        </form>
    `);
}


document.addEventListener(
    'click',
    e => {
        let b = e.target.closest('button');

        if (!b) {
            return;
        }

        if (b.dataset.auth) {
            auth(b.dataset.auth);
        }

        if (b.dataset.page) {
            state.page = b.dataset.page;
            state.search = '';
            render();
        }

        if (b.dataset.action === 'send') {
            state.page = 'send';
            render();
        }

        if (b.dataset.action === 'add') {
            let d = db();
            let u = d.users.find(
                x => x.id === me().id
            );

            u.balance += 5000;

            d.transactions.push({
                id: 't' + Date.now(),
                userId: u.id,
                title: 'Demo funds added',
                category: 'Wallet top-up',
                amount: 5000,
                type: 'credit',
                date: new Date().toLocaleDateString(
                    'en-IN'
                )
            });

            save(d);

            localStorage.setItem(
                'flowpay_session',
                JSON.stringify(u)
            );

            render();

            toast(
                '₹5,000 demo funds added.'
            );
        }

        if (b.dataset.action === 'qr') {
            qrModal();
        }

        if (b.dataset.action === 'addbill') {
            addBillModal();
        }

        if (b.dataset.action === 'editbudget') {
            let x = db().budgets.find(
                x => x.userId === me().id
            );

            modal(`
                <h2>
                    Edit budget
                </h2>

                <form id="budgetForm">

                    <div class="form-grid">

                        <label>
                            Monthly limit (₹)

                            <input
                                name="limit"
                                type="number"
                                value="${x.limit}"
                                required
                            >
                        </label>

                        <label>
                            Month

                            <input
                                name="month"
                                type="month"
                                value="${x.month}"
                                required
                            >
                        </label>

                    </div>

                    <div class="actions">

                        <button class="primary">
                            Save budget
                        </button>

                    </div>

                </form>
            `);
        }

        if (b.dataset.paybill) {
            let bill = db().bills.find(
                x => x.id === b.dataset.paybill
            );

            pay(
                bill.amount,
                bill.name,
                bill.category
            );
        }

        if (b.dataset.togglebill) {
            let d = db();

            let x = d.bills.find(
                x => x.id === b.dataset.togglebill
            );

            x.active = !x.active;

            save(d);
            render();

            toast(
                'Bill status updated.'
            );
        }

        if (
            b.dataset.close ||
            b.id === 'close'
        ) {
            close();
        }

        if (b.id === 'logout') {
            localStorage.removeItem(
                'flowpay_session'
            );

            state.page = 'dashboard';

            render();

            toast(
                'Logged out successfully.'
            );
        }
    }
);


document.addEventListener(
    'input',
    e => {
        if (e.target.matches('[data-search]')) {

            let v = e.target.value;

            state.search = v;

            render();

            let x =
                document.querySelector(
                    '[data-search]'
                );

            if (x) {
                x.focus();

                x.setSelectionRange(
                    v.length,
                    v.length
                );
            }
        }
    }
);


function pay(
    amount,
    title,
    category
) {
    let d = db();

    let u = d.users.find(
        x => x.id === me().id
    );

    if (u.balance < amount) {
        return toast(
            'Insufficient balance. Add demo funds first.'
        );
    }

    u.balance -= Number(amount);

    d.transactions.push({
        id: 't' + Date.now(),
        userId: u.id,
        title,
        category,
        amount: Number(amount),
        type: 'debit',
        date: new Date().toLocaleDateString(
            'en-IN'
        )
    });

    save(d);

    localStorage.setItem(
        'flowpay_session',
        JSON.stringify(u)
    );

    close();

    render();

    toast(
        'Payment successful!'
    );
}


document.addEventListener(
    'submit',
    e => {
        e.preventDefault();

        let f = e.target;

        /*
         * LOGIN
         */
        if (f.id === 'loginForm') {

            let u = db().users.find(
                x =>
                    x.email ===
                        f.loginEmail.value
                            .trim()
                            .toLowerCase() &&
                    x.password ===
                        f.loginPassword.value
            );

            if (!u) {
                return toast(
                    'Incorrect email or password.'
                );
            }

            localStorage.setItem(
                'flowpay_session',
                JSON.stringify(u)
            );

            state.page = 'dashboard';

            render();

            toast(
                'Welcome back!'
            );
        }


        /*
         * SIGN UP
         */
        if (f.id === 'signupForm') {

            let d = db();

            let email =
                f.email.value
                    .trim()
                    .toLowerCase();

            if (
                d.users.some(
                    x => x.email === email
                )
            ) {
                return toast(
                    'Email is already registered.'
                );
            }

            let u = {
                id: 'u' + Date.now(),
                name: f.name.value.trim(),
                email,
                password: f.password.value,
                phone: f.phone.value.trim(),
                role: 'user',
                balance: 0
            };

            d.users.push(u);

            save(d);

            localStorage.setItem(
                'flowpay_session',
                JSON.stringify(u)
            );

            render();

            toast(
                'Wallet created successfully!'
            );
        }


        /*
         * MONEY TRANSFER
         */
        if (f.id === 'transferForm') {

            let d = db();

            let r = d.users.find(
                u =>
                    u.email ===
                        f.recipient.value
                            .trim()
                            .toLowerCase() &&
                    u.role === 'user'
            );

            let amount =
                Number(f.amount.value);

            let u = d.users.find(
                x => x.id === me().id
            );

            if (!r) {
                return toast(
                    'Recipient must be a registered FlowPay user.'
                );
            }

            if (r.id === u.id) {
                return toast(
                    'You cannot send money to yourself.'
                );
            }

            if (u.balance < amount) {
                return toast(
                    'Insufficient balance.'
                );
            }

            u.balance -= amount;
            r.balance += amount;

            let date =
                new Date().toLocaleDateString(
                    'en-IN'
                );

            d.transactions.push(
                {
                    id: 't' + Date.now(),
                    userId: u.id,
                    title: 'Sent to ' + r.name,
                    category: 'Transfer',
                    amount,
                    type: 'debit',
                    date
                },
                {
                    id: 't' + (Date.now() + 1),
                    userId: r.id,
                    title: 'Received from ' + u.name,
                    category: 'Transfer',
                    amount,
                    type: 'credit',
                    date
                }
            );

            save(d);

            localStorage.setItem(
                'flowpay_session',
                JSON.stringify(u)
            );

            state.page = 'transactions';

            render();

            toast(
                'Money sent successfully!'
            );
        }


        /*
         * QR PAYMENT
         */
        if (f.id === 'qrForm') {

            pay(
                f.amount.value,
                'QR payment: ' + f.merchant.value,
                'QR payment'
            );
        }


        /*
         * ADD BILL
         */
        if (f.id === 'billForm') {

            let d = db();

            let x =
                Object.fromEntries(
                    new FormData(f)
                );

            x.id = 'b' + Date.now();
            x.amount = Number(x.amount);
            x.active = true;

            d.bills.push(x);

            save(d);

            close();

            render();

            toast(
                'Bill added.'
            );
        }


        /*
         * BUDGET
         */
        if (f.id === 'budgetForm') {

            let d = db();

            let x =
                Object.fromEntries(
                    new FormData(f)
                );

            let u = me();

            x.userId = u.id;
            x.limit = Number(x.limit);

            let i =
                d.budgets.findIndex(
                    b => b.userId === u.id
                );

            if (i >= 0) {
                d.budgets[i] = x;
            } else {
                d.budgets.push(x);
            }

            save(d);

            close();

            state.page = 'budget';

            render();

            toast(
                'Budget saved.'
            );
        }
    }
);


init();
render();