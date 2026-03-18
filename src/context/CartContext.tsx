import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CartItem, Product } from '../types/cart';
import { Voucher } from '../types/rewards';
import { useAuth } from './AuthContext';

type CartContextType = {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    appliedVoucher: Voucher | null;
    applyVoucher: (voucher: Voucher) => void;
    removeVoucher: () => void;

    subtotal: number;
    discountAmount: number;
    total: number;
    cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useProducts } from './ProductContext';

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const { products } = useProducts();
    const userId = isAuthenticated && user ? (user.username || user.id) : 'guest';
    const storageKey = `ecobrick_cart_${userId}`;

    const [items, setItems] = useState<CartItem[]>([]);
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

    // Load cart on user change
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed: CartItem[] = JSON.parse(stored);
                // Refresh stale product data from ProductContext covering image paths
                const refreshed = parsed.map(item => {
                    const fresh = products.find(p => p.id === item.productId);
                    return fresh ? { ...item, product: fresh } : item;
                });
                setItems(refreshed);
            } catch {
                setItems([]);
            }
        } else {
            setItems([]);
        }
        setAppliedVoucher(null); // Reset voucher on user switch
    }, [userId, storageKey, products]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(items));
    }, [items, storageKey]);

    const addToCart = (product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { productId: product.id, product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
        setAppliedVoucher(null);
    };

    const applyVoucher = (voucher: Voucher) => {
        setAppliedVoucher(voucher);
    };

    const removeVoucher = () => {
        setAppliedVoucher(null);
    };

    // Calculations
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    }, [items]);

    const discountAmount = useMemo(() => {
        if (!appliedVoucher) return 0;

        // Simple logic: parse "10%" or "50000"
        const valStr = appliedVoucher.discount; // e.g. "10%" or "50k"?? user input was "8%" in AdminVouchers

        if (valStr.includes('%')) {
            const percent = parseFloat(valStr.replace('%', ''));
            if (!isNaN(percent)) {
                return (subtotal * percent) / 100;
            }
        } else {
            // Assume fixed amount? currently the system mainly uses %. 
            // Let's safe parse.
            const fixed = parseFloat(valStr);
            if (!isNaN(fixed)) return fixed;
        }
        return 0;
    }, [subtotal, appliedVoucher]);

    const total = Math.max(0, subtotal - discountAmount);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            appliedVoucher,
            applyVoucher,
            removeVoucher,
            subtotal,
            discountAmount,
            total,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
