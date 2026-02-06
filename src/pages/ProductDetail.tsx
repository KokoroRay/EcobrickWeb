import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAssetPath } from '../utils/assets';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const { getProductBySlug, products } = useProducts();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const product = useMemo(() => getProductBySlug(slug || ''), [slug, getProductBySlug, products]);

  // Use first image if array or just image string
  const mainImgSrc = product ? (product.image || 'images/green-mosaic-tile.jpg') : '';

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  // Set default size when product loads
  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  // Related Products (Logic: Same Category, excluding current)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product, products]);

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
    // We could pass selectedSize to cart if CartItem supported it
    // For now, simple add
    addToCart(product, quantity);
    showToast(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`, 'success');
  };

  return (
    <div className="page content" style={{ background: '#fff' }}>
      <section className="product-page" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="product-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>

            {/* Gallery */}
            <div className="product-gallery">
              <div className="main-image" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', position: 'sticky', top: '100px' }}>
                <img src={getAssetPath(mainImgSrc)} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
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

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>Kích thước</h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          padding: '0.5rem 1.25rem',
                          border: selectedSize === size ? '2px solid #20803F' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          background: selectedSize === size ? 'rgba(32, 128, 63, 0.05)' : 'white',
                          color: selectedSize === size ? '#20803F' : '#64748b',
                          fontWeight: selectedSize === size ? 600 : 400,
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="product-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0.8rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>-</button>
                  <span style={{ padding: '0 0.5rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '0.8rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
                </div>

                <button className="btn primary" onClick={handleAddCart} style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <i className="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
                </button>
              </div>

              {/* Detailed Description Section */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>Mô tả chi tiết</h4>
                <div style={{ lineHeight: '1.8', color: '#475569', fontSize: '1rem' }}>
                  <p style={{ marginBottom: '1rem' }}>{product.description}</p>
                  <p>
                    Sản phẩm {product.name} là giải pháp bền vững cho công trình xanh.
                    Được sản xuất từ quy trình tái chế khép kín, đảm bảo chất lượng cao và thẩm mỹ vượt trội.
                    Sử dụng sản phẩm này là bạn đang góp phần giảm thiểu rác thải nhựa ra môi trường.
                  </p>
                </div>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Thông số kỹ thuật</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <li key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b' }}>{key}</span>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span><i className="fa-solid fa-truck-fast" style={{ color: '#20803F' }}></i> Giao hàng toàn quốc</span>
                <span><i className="fa-solid fa-shield-halved" style={{ color: '#20803F' }}></i> Bảo hành chính hãng</span>
                <span><i className="fa-solid fa-rotate-left" style={{ color: '#20803F' }}></i> Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products-section" style={{ marginTop: '5rem', borderTop: '1px solid #e2e8f0', paddingTop: '3rem' }}>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Sản phẩm đề xuất</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Có thể bạn cũng quan tâm đến các sản phẩm này</p>

              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                {relatedProducts.map(item => (
                  <Link to={`/products/${item.slug}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }} className="related-card-link">
                    <article className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                      <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '75%' }}>
                        <img
                          src={getAssetPath(item.image || 'images/hdpe.jpg')}
                          alt={item.name}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="card-body" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>{item.category}</div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>{item.name}</h3>
                        <div style={{ marginTop: 'auto', color: '#20803F', fontWeight: 700, fontSize: '1.1rem' }}>{item.price.toLocaleString()} ₫</div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
