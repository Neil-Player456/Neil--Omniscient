import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  
import { RouterProvider } from "react-router-dom";  
import { router } from "./routes";  
import { StoreProvider } from './hooks/useGlobalReducer';  
import { BackendURL } from './components/BackendURL';
import { CartProvider } from 'react-use-cart';

const Main = () => {
    
    if(! import.meta.env.VITE_BACKEND_URL ||  import.meta.env.VITE_BACKEND_URL == "") return (
        <React.StrictMode>
              <BackendURL/ >
        </React.StrictMode>
        );
    return (
        <React.StrictMode>  
            <StoreProvider>  
                <CartProvider>
                <RouterProvider router={router}>
                </RouterProvider>
                </CartProvider>
            </StoreProvider>
        </React.StrictMode>
    );
}


ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
