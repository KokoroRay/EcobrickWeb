import { Link } from 'react-router-dom';
import { products } from '../data/products';

export default function Products() {
  return (
    <div className="page content">
      <section className="section pad">
        <div className="container">
        <h2 className="section-title">SẢN PHẨM</h2>
        <p className="section-sub">Toàn bộ sản phẩm gạch tái chế</p>

        <div className="grid-3">
          {products.map((product) => (
            <article className="card" key={product.id}>
              <img src={product.images[0]} alt={product.name} />
              <div className="card-body">
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
                <Link to={`/products/${product.slug}`} className="btn outline">
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
