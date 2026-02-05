import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { products } from '../data/products';

const sizes = ['300x300', '400x400', '500x500'];

export default function ProductDetail() {
  const { slug } = useParams();
  const product = useMemo(() => products.find((item) => item.slug === slug), [slug]);
  const [mainImage, setMainImage] = useState(product?.images[0] ?? '');
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [clicked, setClicked] = useState(false);

  if (!product) {
    return (
      <section className="page content">
        <div className="section pad center">
          <h2 className="section-title">Không tìm thấy sản phẩm</h2>
          <p className="section-sub">Vui lòng quay lại danh sách sản phẩm.</p>
          <Link to="/products" className="btn primary">
            Quay lại sản phẩm
          </Link>
        </div>
      </section>
    );
  }

  const handleThumbnail = (image: string) => {
    setMainImage(image);
  };

  const handleAddCart = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  };

  return (
    <section className="page content product-page">
      <div className="product-container">
        <div className="product-gallery">
          <div className="main-image">
            <img id="mainProductImage" src={mainImage} alt={product.name} />
          </div>
          <div className="thumbnail-list">
            {product.images.map((image) => (
              <img
                key={image}
                src={image}
                className={`thumb${mainImage === image ? ' active' : ''}`}
                alt={product.name}
                onClick={() => handleThumbnail(image)}
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">Giá: <strong>{product.price}</strong></p>
          <p className="product-desc">{product.description}</p>

          <div className="product-option">
            <h4>Kích thước</h4>
            <div className="size-options">
              {sizes.map((size) => (
                <span
                  key={size}
                  className={`size${selectedSize === size ? ' active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          <button className={`btn add-cart${clicked ? ' clicked' : ''}`} onClick={handleAddCart}>
            <i className="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      <section className="related-products">
        <h2 className="section-title">Sản phẩm tương tự</h2>
        <div className="related-list">
          {products
            .filter((item) => item.slug !== product.slug)
            .slice(0, 3)
            .map((item) => (
              <div className="related-item" key={item.id}>
                <img src={item.images[0]} alt={item.name} />
                <h4>{item.name}</h4>
                <p>{item.price}</p>
              </div>
            ))}
        </div>
      </section>
    </section>
  );
}
