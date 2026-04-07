// ============================================================
// FILE: api.js
// PURPOSE: This is the communication hub between your React app
//          and the backend server. Think of it as a telephone
//          switchboard — all calls to the server go through here.
// ============================================================


// "import" brings in code from another file or library.
// "axios" is a third-party library (installed via npm) that makes
// sending HTTP requests easy. HTTP requests are how your app talks
// to the server — like asking "give me the user's balance" or
// "save this new password". Without axios you'd use the more
// complex built-in browser tool called "fetch".
import axios from "axios";


// A "const" is a variable whose value never changes after it's set.
// API_BASE_URL stores the starting address of your backend server.
// Every request your app makes will begin with this URL.
// "localhost:8090" means "on this same computer, at port 8090"
// — used when testing on your own machine.
// const API_BASE_URL = "http://localhost:8090/api"; //local url

// This line is COMMENTED OUT (the "//" at the start makes JS ignore it).
// It's the real internet address of the production server.
// The developer switches between the two depending on whether
// they are testing locally or running the live app.
const API_BASE_URL = "http://56.68.67.211:8090/api";//prod url


// "axios.create()" builds a CUSTOM axios instance.
// Think of it like a pre-addressed envelope — instead of writing
// the full server address on every request, this instance already
// knows it. All options inside {} apply to every single request
// made through this "api" object.
const api = axios.create({
    baseURL: API_BASE_URL,          // every request starts with this URL
    headers: {                       // "headers" are extra info attached to every request
        'Content-Type': 'application/json' // tells the server: "I'm sending data as JSON"
                                           // JSON is a standard text format for structured data
                                           // e.g. { "email": "a@b.com", "password": "1234" }
    },
});


// AN INTERCEPTOR is like a security checkpoint at an airport.
// Every time your app tries to send a request to the server,
// it stops here FIRST before going anywhere.
// "api.interceptors.request.use()" registers a function that
// runs automatically before EVERY outgoing request.
api.interceptors.request.use(
    // This is the SUCCESS handler — runs before every request
    (config) => {
        // "localStorage" is the browser's built-in storage — like sticky notes
        // the browser keeps even after you close the tab.
        // "getItem('token')" reads the sticky note labelled 'token'.
        // A TOKEN is like a VIP wristband you receive after logging in.
        // You show it to the server so it knows who you are.
        const token = localStorage.getItem('token');

        // "if (token)" means: "if the token exists (is not null/empty)"
        if (token) {
            // Attach the token to the request's Authorization header.
            // "Bearer" is a standard word that means "here is my auth token".
            // The backtick string `Bearer ${token}` inserts the token value
            // into the text automatically — e.g. "Bearer eyJhbGci..."
            config.headers.Authorization = `Bearer ${token}`
        }

        // Return "config" to send the request on its way
        // (now with the token attached if one existed).
        return config;
    },

    // This is the ERROR handler — runs if something goes wrong
    // BEFORE the request is even sent (rare, but handled just in case).
    // "Promise.reject(error)" passes the error along so the calling
    // code can handle it.
    (error) => {
        return Promise.reject(error)
    }
);


// "export" makes this object available to OTHER files that import it.
// "const apiService" is a JavaScript OBJECT — a collection of named
// functions (called "methods") grouped together under one name.
// Think of it as a toolbox: each tool has a name and does one job.
// Other files (like Navbar.jsx, Guard.js) import this toolbox
// and call whichever tool they need.
export const apiService = {

    // -------------------------------------------------------
    // saveAuthData: called RIGHT AFTER a successful login.
    // The server sends back a token (wristband) and roles
    // (a list of what the user is allowed to do).
    // This function saves BOTH to localStorage (browser sticky notes).
    // Parameters: token (string), roles (array like ["CUSTOMER"])
    // -------------------------------------------------------
    saveAuthData: (token, roles) => {
        // Write the token string to localStorage under the key 'token'
        localStorage.setItem('token', token)

        // "roles" is an array (a list), e.g. ["CUSTOMER"].
        // localStorage can only store plain TEXT, not arrays.
        // "JSON.stringify()" converts the array into a text version:
        // ["CUSTOMER"]  →  '["CUSTOMER"]'
        // so it can be saved as a string.
        localStorage.setItem('roles', JSON.stringify(roles))
    },


    // -------------------------------------------------------
    // logout: wipes the user's credentials from localStorage.
    // Once the token is gone, the interceptor above won't find
    // anything, so future requests will have no wristband and
    // the server will reject them (user is effectively signed out).
    // -------------------------------------------------------
    logout: () => {
        localStorage.removeItem('token') // delete the 'token' sticky note
        localStorage.removeItem('roles') // delete the 'roles' sticky note
    },


    // -------------------------------------------------------
    // hasRole: checks whether the logged-in user has a specific role.
    // Parameter: role — a string like 'ADMIN', 'CUSTOMER', 'AUDITOR'
    // Returns: true if the user has that role, false otherwise
    // -------------------------------------------------------
    hasRole(role) {
        // Read the saved roles text from localStorage
        // (it was stored as a JSON string, e.g. '["CUSTOMER"]')
        const roels = localStorage.getItem('roles') // Note: "roels" is a typo in the code, should be "roles" — but it still works

        // The "?" here is a TERNARY OPERATOR — a short if/else:
        //   condition ? valueIfTrue : valueIfFalse
        // If roels exists (is not null):
        //   JSON.parse() converts '["CUSTOMER"]' back into a real array ["CUSTOMER"]
        //   .includes(role) checks if that array contains the role we asked about
        //   → returns true or false
        // If roels is null (no roles saved):
        //   → return false (user has no roles)
        return roels ? JSON.parse(roels).includes(role) : false;
    },


    // -------------------------------------------------------
    // isAuthenticated: checks whether the user is logged in at all.
    // Returns: true if a token exists in localStorage, false if not.
    // "!== null" means "is NOT equal to nothing".
    // localStorage.getItem returns null when a key doesn't exist.
    // -------------------------------------------------------
    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    },


    // -------------------------------------------------------
    // isAdmin / isCustomer / isAuditor:
    // These are shortcut helper functions so other files don't
    // have to write hasRole('ADMIN') etc. every time.
    // "this" refers to the apiService object itself,
    // so "this.hasRole(...)" calls the hasRole function above.
    // -------------------------------------------------------

    isAdmin() {
        return this.hasRole('ADMIN');
    },

    isCustomer() {
        return this.hasRole('CUSTOMER');
    },

    isAuditor() {
        return this.hasRole('AUDITOR');
    },


    // -------------------------------------------------------
    // AUTH REQUESTS
    // These functions send data TO the server (HTTP POST).
    // POST is like filling out a paper form and handing it in.
    // "body" is the data object being sent, e.g.:
    //   { email: "john@example.com", password: "secret123" }
    // Each function returns a PROMISE — a "ticket" that
    // represents a future response. The calling code uses
    // .then() to handle the response when it arrives, or
    // async/await syntax.
    // -------------------------------------------------------

    // Sends login credentials → server checks them and returns a token + roles
    login: (body) => {
        return api.post('/auth/login', body); // POST to http://localhost:8090/api/auth/login
    },

    // Sends new user details → server creates the account
    register: (body) => {
        return api.post('/auth/register', body);
    },

    // Sends user's email → server emails them a password reset link
    forgetPassword: (body) => {
        return api.post('/auth/forgot-password', body)
    },

    // Sends the new password (and a reset token from the email link)
    // → server updates the password in the database
    resetPassword: (body) => {
        return api.post('/auth/reset-password', body)
    },


    // -------------------------------------------------------
    // USER REQUESTS
    // GET requests ask the server to RETURN data.
    // Think of GET as "give me something" — no data sent.
    // PUT requests UPDATE existing data on the server.
    // -------------------------------------------------------

    // Asks the server to return the logged-in user's profile info
    getMyProfile: () => {
        return api.get('/users/me'); // GET http://localhost:8090/api/users/me
    },

    // Sends old + new password → server updates it in the database.
    // { oldPassword, newPassword } is JS shorthand for
    // { oldPassword: oldPassword, newPassword: newPassword }
    // (when variable name matches key name, you can write it once)
    updatePassword: (oldPassword, newPassword) => {
        return api.put('/users/update-password', {
            oldPassword,
            newPassword
        });
    },

    // Uploads a profile picture file to the server.
    // Files can't be sent as JSON, so we use "FormData" —
    // a special browser object designed for sending files.
    // The header changes to 'multipart/form-data' to tell
    // the server "I'm sending a file, not plain text JSON".
    uploadProfilePicture: (file) => {
        const formData = new FormData();    // create the special file container
        formData.append('file', file);      // put the chosen file inside it, labelled 'file'

        return api.put('/users/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // override the default JSON content type
            }
        });
    },


    // -------------------------------------------------------
    // ACCOUNT REQUESTS
    // -------------------------------------------------------

    // Asks the server to return all bank accounts belonging to this user
    getMyAccounts: () => {
        return api.get("/accounts/me")
    },

    // Sends transfer details (from account, to account, amount)
    // → server processes the transfer and creates a transaction record
    makeTransfer: (transferData) => {
        return api.post('/transactions', transferData);
    },

    // Sends deposit details → server adds the amount to the account.
    // NOTE: uses the same /transactions endpoint as makeTransfer —
    // the server distinguishes between them based on the data sent.
    makeDeposit: (depositDate) => {
        return api.post('/transactions', depositDate);
    },

    // Gets a paginated list of transactions for a specific account.
    // "page" and "size" have DEFAULT VALUES (page=0, size=10) —
    // if you call getTransactions("ACC123") without specifying page/size,
    // it automatically uses page 0 and 10 results per page.
    // The backtick string builds the URL dynamically:
    // e.g. /transactions/ACC123?page=0&size=10
    getTransactions: (accountNumber, page = 0, size = 10) => {
        return api.get(`/transactions/${accountNumber}?page=${page}&size=${size}`);
    },


    // -------------------------------------------------------
    // AUDITOR REQUESTS
    // These are only for users with the ADMIN or AUDITOR role.
    // They can see system-wide data (not just their own).
    // -------------------------------------------------------

    // Returns system-wide totals (total deposits, total users, etc.)
    getSystemTotals: () => {
        return api.get('/audit/totals');
    },

    // Finds a user by their email address — auditor search tool
    findUserByEmail: (email) => {
        return api.get(`/audit/users?email=${email}`); // e.g. /audit/users?email=john@example.com
    },

    // Finds a bank account by its account number — auditor search tool
    findAccountByAccountNumber: (accountNumber) => {
        return api.get(`/audit/accounts?accountNumber=${accountNumber}`);
    },

    // Gets all transactions linked to a specific account number
    getTransactionsByAccountNumber: (accountNumber) => {
        return api.get(`/audit/transactions/by-account?accountNumber=${accountNumber}`);
    },

    // Gets a single transaction by its unique ID
    getTransactionById: (id) => {
        return api.get(`/audit/transactions/by-id?id=${id}`);
    }


} // end of apiService object


// "export default" exports the raw axios instance (not apiService).
// Other files that need direct low-level access to axios can import this.
// The "apiService" above was a NAMED export (import { apiService } from ...)
// This is a DEFAULT export (import api from ...)
export default api;
