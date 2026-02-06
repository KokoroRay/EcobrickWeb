import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// import { useRewards } from '../context/RewardsContext'; // For getting valid vouchers if needed
import { useState } from 'react';
import { useRewards } from '../context/RewardsContext';

export default function Cart() {
    const { items, updateQuantity, removeFromCart, subtotal, discountAmount, total, appliedVoucher, applyVoucher, removeVoucher } = useCart();
    const { claimedVouchers } = useRewards(); // User's My Vouchers
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherError, setVoucherError] = useState('');

    const handleApplyVoucher = () => {
        setVoucherError('');
        // Find voucher in user's claimed vouchers
        const found = claimedVouchers.find(v => v.code === voucherCode && v.status === 'claimed'); // or 'active'

        // Also check if it's a valid system voucher if we allowed generic codes? 
        // For now, restrict to claimed vouchers for logic consistency with "Redeem" feature.

        if (found) {
            applyVoucher(found);
            setVoucherCode('');
        } else {
            setVoucherError('Mã voucher không hợp lệ hoặc bạn chưa sở hữu.');
        }
    };

    if (items.length === 0) {
        return (
            <div className="page content" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="container">
                    <i className="fa-solid fa-cart-shopping" style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }}></i>
                    <h2 style={{ marginBottom: '1rem', color: '#334155' }}>Giỏ hàng trống</h2>
                    <p style={{ marginBottom: '2rem', color: '#64748b' }}>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                    <Link to="/products" className="btn primary">Tiếp tục mua sắm</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page content" style={{ background: '#f8fafc', minHeight: '80vh', padding: '2rem 0' }}>
            <div className="container">
                <h2 className="section-title" style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '2rem' }}>Giỏ hàng</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>

                    {/* Cart Items List */}
                    <div className="cart-list" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        {items.map(item => (
                            <div key={item.productId} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                <img src={item.product.image} alt={item.product.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', background: '#f1f5f9' }} />

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>
                                            <Link to={`/products/${item.product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{item.product.name}</Link>
                                        </h3>
                                        <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>

                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{item.product.category}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 700, color: '#20803F' }}>
                                            {item.product.price.toLocaleString()} ₫
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                style={{ width: '28px', height: '28px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                            >-</button>
                                            <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                style={{ width: '28px', height: '28px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="cart-summary" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' }}>Tổng đơn hàng</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b' }}>
                            <span>Tạm tính</span>
                            <span>{subtotal.toLocaleString()} ₫</span>
                        </div>

                        {/* Voucher Section */}
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            {appliedVoucher ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#20803F', fontSize: '0.9rem' }}><i className="fa-solid fa-ticket"></i> {appliedVoucher.code}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Giảm {appliedVoucher.discount}</div>
                                    </div>
                                    <button onClick={removeVoucher} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Bỏ</button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Mã giảm giá"
                                            value={voucherCode}
                                            onChange={(e) => setVoucherCode(e.target.value)}
                                            style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                                        />
                                        <button
                                            onClick={handleApplyVoucher}
                                            className="btn outline"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                    {voucherError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{voucherError}</div>}
                                </div>
                            )}
                        </div>

                        {appliedVoucher && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#20803F', fontWeight: 600 }}>
                                <span>Giảm giá</span>
                                <span>- {discountAmount.toLocaleString()} ₫</span>
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                            <span>Tổng tiền</span>
                            <span>{total.toLocaleString()} ₫</span>
                        </div>

                        <button className="btn primary" style={{ width: '100%' }} onClick={() => alert('Chức năng thanh toán đang phát triển!')}>
                            Thanh toán ngay
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
