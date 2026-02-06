import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAssetPath } from '../utils/assets';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const { getProductBySlug } = useProducts();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const product = useMemo(() => getProductBySlug(slug || ''), [slug, getProductBySlug]);

  // Use first image if array or just image string
  const mainImgSrc = product ? (product.image || getAssetPath('ecobrick-std.jpg')) : '';

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="page content" style={{ padding: '4rem 0' }}>
        <section className="section pad">
          <div className="container center" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Không tìm thấy sản phẩm</h2>
            <p className="section-sub">Vui lòng quay lại danh sách sản phẩm.</p>
            <Link to="/products" className="btn primary">
              Quay lại danh sách
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const handleAddCart = () => {
    addToCart(product, quantity);
    showToast('success', `Đã thêm ${product.name} vào giỏ hàng!`);
  };

  return (
    <div className="page content" style={{ background: '#fff' }}>
      <section className="product-page" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="product-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>

            {/* Gallery */}
            <div className="product-gallery">
              <div className="main-image" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
                <img id="mainProductImage" src={mainImgSrc} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>

            {/* Info */}
            <div className="product-info">
              <div style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{product.category}</div>
              <h1 className="product-title" style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '1rem', lineHeight: 1.2 }}>{product.name}</h1>

              <div className="product-price" style={{ fontSize: '1.75rem', color: '#20803F', fontWeight: 700, marginBottom: '1.5rem' }}>
                {product.price.toLocaleString()} ₫
              </div>

              <p className="product-desc" style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, marginBottom: '2rem' }}>
                {product.description}
              </p>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Thông số kỹ thuật</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <li key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b' }}>{key}</span>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action */}
              <div className="product-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>-</button>
                  <span style={{ padding: '0 0.5rem', fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
                </div>

                <button className="btn primary" onClick={handleAddCart} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <i className="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
                </button>
              </div>

              <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-truck-fast"></i> Giao hàng toàn quốc • <i className="fa-solid fa-shield-halved"></i> Bảo hành chính hãng
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
