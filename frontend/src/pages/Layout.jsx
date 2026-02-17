import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useEffect, useRef } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"


export const Layout = () => {
    const { store, getUserById } = useGlobalReducer();
    const hasValidatedRef = useRef(false);

    // Validate access token on app startup if it exists
    // Use ref to prevent duplicate calls in React StrictMode
    useEffect(() => {
        if (hasValidatedRef.current) return;
        
        const token = localStorage.getItem("access_token");
        // Always validate token if it exists (user might be stale from localStorage)
        if (token) {
            hasValidatedRef.current = true;
            // Validate token - this will update store.user if valid, or clear it if invalid
            getUserById();
        }
    }, []); // Only run once on mount

    return (
        <ScrollToTop>
            <Navbar />
                <Outlet />
            <Footer />
        </ScrollToTop>
    )
}