// ============================================================
// FILE: Guard.js
// PURPOSE: This file acts as a SECURITY GUARD for certain pages.
//          Some pages (like the dashboard) should only be accessible
//          to users with the correct role. These "route guard"
//          components check the user's role BEFORE showing a page.
//          If the user doesn't qualify, they get sent to /login instead.
// ============================================================


// "import" pulls in code from other files/libraries.

// "Navigate" is a React Router component that IMMEDIATELY redirects
// the user to a different page — like a bouncer saying "you can't
// come in here, go to the other door instead."
// "useLocation" is a React HOOK — a special function React provides.
// It tells you the URL the user is currently trying to visit.
// We need this so after login, we can send them back to the page
// they were originally trying to reach.
import { Navigate, useLocation } from "react-router-dom";

// Import the apiService toolbox from api.js so we can call
// isCustomer(), isAdmin(), isAuditor() to check the user's role.
import { apiService } from "./api";


// -------------------------------------------------------
// CustomerRoute: a ROUTE GUARD for customer-only pages.
//
// HOW IT WORKS:
//   Wrap a page component with <CustomerRoute element={<SomePage/>} />
//   → If the user IS a customer: show the page normally
//   → If the user is NOT a customer: redirect them to /login
//
// PARAMETER EXPLANATION:
//   ({element: Component}) — this is called DESTRUCTURING WITH RENAMING.
//   The component receives a prop (an input) called "element".
//   The ": Component" part renames it to "Component" for use inside.
//   A "prop" is how you pass data INTO a React component,
//   like arguments to a function.
//   Example usage in App.js:
//     <CustomerRoute element={<TransferPage />} />
// -------------------------------------------------------
export const CustomerRoute = ({element: Component}) => {

    // useLocation() returns an object describing the current URL.
    // e.g. if the user was trying to visit /transfer,
    // location.pathname would be "/transfer".
    // We save this so we can pass it along to the login page.
    const location = useLocation();

    // TERNARY OPERATOR: condition ? valueIfTrue : valueIfFalse
    // This is a shorthand if/else on a single line.
    //
    // If apiService.isCustomer() returns true:
    //   → render "Component" (show the protected page as normal)
    // If apiService.isCustomer() returns false:
    //   → render <Navigate .../> which INSTANTLY redirects to /login
    return apiService.isCustomer() ? (
        Component
    ):(
        // <Navigate> is a special React Router component.
        // Rendering it causes an immediate redirect — no click needed.
        // to="/login"          → send the user to the /login page
        // replace              → replace the current browser history entry
        //                        instead of adding a new one, so clicking
        //                        the back button won't loop back to this
        //                        protected page they can't access
        // state={{from: location}} → secretly pass the current URL to the
        //                        login page. After successful login, the app
        //                        can read this and redirect the user back to
        //                        the page they originally wanted.
        <Navigate to="/login" replace state={{from: location}}/>
    )
}


// -------------------------------------------------------
// AuditorRoute: a ROUTE GUARD for auditor/admin-only pages.
//
// Same concept as CustomerRoute, but for pages that ADMINS
// and AUDITORS are allowed to see (either role qualifies).
//
// The "||" symbol means OR:
//   isAdmin() || isAuditor() → true if the user is EITHER an admin OR an auditor
// -------------------------------------------------------
export const AuditorRoute = ({element: Component}) => {

    // Capture the current URL so we can redirect back after login
    const location = useLocation();

    // If the user is an admin OR an auditor → show the page
    // Otherwise → redirect to /login (with the current location saved)
    return apiService.isAdmin() || apiService.isAuditor() ? (
        Component
    ):(
        <Navigate to="/login" replace state={{from: location}}/>
    )
}
