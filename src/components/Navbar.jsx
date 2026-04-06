// ============================================================
// FILE: Navbar.jsx
// PURPOSE: The navigation bar displayed at the top of every page.
//          It shows different links depending on whether the user
//          is logged in, and what role they have (admin/auditor/customer).
//          It also handles the logout confirmation popup (modal).
// ============================================================


// "useState" is a React HOOK — a special function React provides.
// It lets a component "remember" a value between re-renders.
// When the value changes, React automatically re-draws the screen.
// We use it here to remember whether the logout popup is open or closed.
import { useState } from "react";

// "Link" is React Router's version of a normal <a href="..."> tag.
// A regular <a> tag would RELOAD the whole page — Link switches
// the view instantly without a reload, making the app feel fast.
//
// "useNavigate" is a React Router HOOK that gives you a function
// to navigate to a different page FROM CODE (not from a user click).
// We use it to go to /login after the user confirms logout.
import { Link, useNavigate } from "react-router-dom";

// Import the apiService toolbox from api.js so we can check
// whether the user is logged in and what their role is.
import { apiService } from "../services/api";


// -------------------------------------------------------
// Navbar is a React COMPONENT — a JavaScript function that
// returns JSX (HTML-like code). React will call this function
// whenever it needs to draw (or re-draw) the navbar on screen.
// The "const Navbar = () => {" syntax defines it as an arrow function.
// -------------------------------------------------------
const Navbar = () => {

    // Read the user's status from localStorage via apiService helpers.
    // These are plain true/false values calculated once when the
    // component loads. They decide what links to show.
    const isAdmin = apiService.isAdmin();               // true if role includes 'ADMIN'
    const isAuthenticated = apiService.isAuthenticated(); // true if a token exists (user is logged in)
    const isAuditor = apiService.isAuditor();           // true if role includes 'AUDITOR'

    // useState(false) creates a STATE VARIABLE called "showModal".
    // STATE is memory that React tracks. When it changes, React
    // re-draws the component automatically.
    //
    // useState returns an ARRAY of two things:
    //   showModal     — the current value (false = popup is hidden)
    //   setShowModal  — the function you call to UPDATE the value
    //
    // false is the INITIAL VALUE (popup starts hidden).
    const [showModal, setShowModal] = useState(false);

    // useNavigate() gives us the "navigate" function.
    // Calling navigate("/login") programmatically sends the user
    // to the /login page — useful after logout when there's no
    // link to click, the code needs to do the navigation itself.
    const navigate = useNavigate();


    // -------------------------------------------------------
    // handleLogout: runs when the user CLICKS the "Logout" button.
    // It does NOT log out immediately — it just opens the
    // confirmation popup by setting showModal to true.
    // React sees the state changed and re-draws the navbar,
    // this time with the popup visible.
    // -------------------------------------------------------
    const handleLogout = () => {
        setShowModal(true) // show the "Are you sure?" popup
    }

    // -------------------------------------------------------
    // confirmLogout: runs when the user clicks "Yes" in the popup.
    // This is the REAL logout — it does three things in order:
    //   1. Delete the token + roles from localStorage (wipe credentials)
    //   2. Hide the popup
    //   3. Navigate to /login
    // -------------------------------------------------------
    const confirmLogout = () => {
        apiService.logout();    // step 1: clear localStorage (erase token & roles)
        setShowModal(false)     // step 2: hide the popup
        navigate("/login")      // step 3: send the user to the login page
    }

    // -------------------------------------------------------
    // cancelLogout: runs when the user clicks "No" in the popup.
    // Simply hides the popup — nothing else changes.
    // -------------------------------------------------------
    const cancelLogout = () => {
        setShowModal(false); // hide the popup, user stays logged in
    };


    // -------------------------------------------------------
    // RETURN: the visual structure of the Navbar.
    // Everything inside "return ()" is JSX — it looks like HTML
    // but is actually JavaScript that React converts to real HTML.
    //
    // KEY JSX RULES:
    //   - Use "className" instead of "class" (class is reserved in JS)
    //   - Wrap JavaScript expressions in curly braces { }
    //   - A component must return ONE root element (we use <nav> here)
    // -------------------------------------------------------
    return (
        // <nav> is a semantic HTML element meaning "navigation section"
        // className="navbar" applies CSS styles defined in index.css
        <nav className="navbar">

            {/* A <div> is a generic container used for layout/grouping */}
            <div className="navbar-container">

                {/* <Link to="/"> makes "SixSeven Bank" a clickable logo
                    that navigates to the home route "/" without reloading */}
                <Link to="/" className="navbar-logo">
                    SixSeven Bank
                </Link>

                {/* <ul> = unordered list, <li> = list item.
                    Standard HTML structure for navigation menus. */}
                <ul className="navbar-menu">

                    {/* The Home link is always visible to everyone */}
                    <li className="navbar-item">
                        <Link to="/home" className="navbar-link">Home</Link>
                    </li>

                    {/* TERNARY OPERATOR: condition ? showIfTrue : showIfFalse
                        { } curly braces = "run JavaScript inside JSX"
                        If the user IS logged in → show the logged-in menu
                        If the user is NOT logged in → show Login & Register */}
                    {isAuthenticated ? (

                        // <> </> is a FRAGMENT — an invisible wrapper that lets
                        // us return multiple <li> elements without adding an
                        // extra <div> to the real HTML.
                        <>
                            {/* These links are only shown when logged in */}
                            <li className="navbar-item">
                                <Link to="/profile" className="navbar-link">Profile</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/transfer" className="navbar-link">Transfer</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/transactions" className="navbar-link">Transactions</Link>
                            </li>

                            {/* && SHORT-CIRCUIT: in JS, "true && <something>" returns <something>
                                and "false && <something>" returns false (React renders nothing).
                                So this block ONLY appears if the user is an admin OR an auditor.
                                Regular customers never see Auditor Dashboard or Deposit. */}
                            {(isAdmin || isAuditor) && (
                                <>
                                    <li className="navbar-item">
                                        <Link to="/auditor-dashboard" className="navbar-link">Auditor Dashboard</Link>
                                    </li>

                                    <li className="navbar-item">
                                        <Link to="/deposit" className="navbar-link">Deposit</Link>
                                    </li>
                                </>
                            )}

                            {/* Logout uses a <button> instead of <Link> because
                                clicking it should run CODE first (open the popup),
                                not navigate to a page directly.
                                onClick={handleLogout} is an EVENT LISTENER —
                                when the button is clicked, the handleLogout
                                function is called automatically. */}
                            <li className="navbar-item">
                                <button
                                    className="navbar-link logout-btn"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </>

                    ) : (
                        // The user is NOT logged in — show Login and Register links only
                        <>
                            <li className="navbar-item">
                                <Link to="/login" className="navbar-link">Login</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/register" className="navbar-link">Register</Link>
                            </li>
                        </>
                    )}

                </ul>
            </div>


            {/* LOGOUT CONFIRMATION MODAL (popup)
                Using the && short-circuit again:
                  showModal && (...)  →  only renders the popup when showModal is true.
                When the user clicked "Logout", setShowModal(true) was called,
                React re-ran this component, showModal is now true, so the popup appears.
                When the user clicks Yes or No, setShowModal(false) is called,
                React re-runs again, showModal is false, so the popup disappears. */}
            {showModal && (
                // modal-backdrop: a dark overlay that covers the whole screen
                <div className="modal-backdrop">
                    {/* modal: the white box in the center of the screen */}
                    <div className="modal">
                        <p>Are you sure you want to logout?</p>
                        <div className="modal-actions">
                            {/* onClick={confirmLogout} → calls confirmLogout() when clicked
                                confirmLogout wipes credentials, hides popup, goes to /login */}
                            <button onClick={confirmLogout} className="btn-confirm">Yes</button>

                            {/* onClick={cancelLogout} → calls cancelLogout() when clicked
                                cancelLogout just hides the popup, user stays logged in */}
                            <button onClick={cancelLogout} className="btn-cancel">No</button>
                        </div>
                    </div>
                </div>
            )}

        </nav>
    );
};

// "export default" makes Navbar the main export of this file.
// Other files import it like: import Navbar from './components/Navbar'
// The word "default" means this is the primary thing this file exports.
export default Navbar;
