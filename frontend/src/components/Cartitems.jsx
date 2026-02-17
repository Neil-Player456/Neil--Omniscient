import React, { useContext } from 'react';
import { CartContext } from './CartContext';

export const Cartitems = ({item}) => {

    const { removeFromCart } = useContext(CartContext);

        return (
            <div className="cart-item">
                <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price.toFixed(2)}</p>
                    <p>Subtotal: ${(item.quantity * item.price).toFixed(2)}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
        );
    };