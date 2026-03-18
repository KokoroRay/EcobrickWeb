import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { getAssetPath } from '../utils/assets';

export default function Products() {
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim().toLowerCase() || '';

  const filteredProducts = query
    ? products.filter((product) => {
      const searchableText = [product.name, product.category, product.description].join(' ').toLowerCase();
      return searchableText.includes(query);
    })
    : products;

  return (
    <div className="page content" style={{ background: '#f8fafc' }}>
      <section className="section pad">
        <div className="container">
          <h2 className="section-title">SẢN PHẨM</h2>
          <p className="section-sub">
            {query ? `Kết quả tìm kiếm cho "${searchParams.get('q')}"` : 'Toàn bộ sản phẩm gạch tái chế'}
          </p>

          {query && filteredProducts.length === 0 && (
            <div
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                color: '#475569',
                marginBottom: '1rem',
                textAlign: 'center'
              }}
            >
              Không tìm thấy sản phẩm phù hợp, vui lòng thử từ khóa khác.
            </div>
          )}

          <div className="grid-3">
            {filteredProducts.map((product) => (
              <article className="card" key={product.id}>
                <img
                  src={getAssetPath(product.image || 'images/ecobrick-std.jpg')}
                  alt={product.name}
                  style={{ background: '#e2e8f0' }}
                />
                <div className="card-body">
                  <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {product.category}
                  </div>
                  <h3>{product.name}</h3>
                  <div style={{ fontSize: '1.25rem', color: '#20803F', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {product.price.toLocaleString()} ₫
                  </div>
                  <p className="line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                  </p>
                  <Link to={`/products/${product.slug}`} className="btn outline" style={{ marginTop: 'auto', textAlign: 'center' }}>
                    Xem chi tiết
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
