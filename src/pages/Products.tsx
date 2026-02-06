import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

export default function Products() {
  const { products } = useProducts();

  return (
    <div className="page content" style={{ background: '#f8fafc' }}>
      <section className="section pad">
        <div className="container">
          <h2 className="section-title">SẢN PHẨM</h2>
          <p className="section-sub">Toàn bộ sản phẩm gạch tái chế</p>

          <div className="grid-3">
            {products.map((product) => (
              <article className="card" key={product.id}>
                <img
                  src={product.image || '/assets/ecobrick-std.jpg'}
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
