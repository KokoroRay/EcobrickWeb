import { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types/cart';

export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState<string>('');
    const [category, setCategory] = useState('Standard');
    const [stock, setStock] = useState<string>('');
    const [desc, setDesc] = useState('');
    const [image, setImage] = useState('');

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setSlug('');
        setPrice('');
        setCategory('Standard');
        setStock('');
        setDesc('');
        setImage('');
    };

    const handleEdit = (p: Product) => {
        setEditingId(p.id);
        setName(p.name);
        setSlug(p.slug);
        setPrice(p.price.toString());
        setCategory(p.category);
        setStock(p.stock.toString());
        setDesc(p.description);
        setImage(p.image);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = () => {
        if (!name || !slug || !price) {
            alert("Vui lòng nhập tên, mã (slug) và giá.");
            return;
        }

        const productData = {
            name,
            slug,
            price: parseFloat(price),
            category,
            stock: parseInt(stock) || 0,
            description: desc,
            image: image || '/assets/ecobrick-std.jpg',
            specifications: {}
        };

        if (editingId) {
            updateProduct({ ...productData, id: editingId });
            alert("Cập nhật thành công!");
        } else {
            addProduct(productData);
            alert("Thêm sản phẩm thành công!");
        }
        resetForm();
    };

    return (
        <div>
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý Sản phẩm</h2>
                <p className="admin-page-desc">Thêm sửa xóa sản phẩm trong cửa hàng.</p>
            </div>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                    {editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-input-group">
                        <label>Tên sản phẩm</label>
                        <input className="form-field" value={name} onChange={e => { setName(e.target.value); if (!editingId) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')); }} />
                    </div>
                    <div className="form-input-group">
                        <label>Slug (URL)</label>
                        <input className="form-field" value={slug} onChange={e => setSlug(e.target.value)} />
                    </div>
                    <div className="form-input-group">
                        <label>Giá (VNĐ)</label>
                        <input className="form-field" type="number" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                    <div className="form-input-group">
                        <label>Danh mục</label>
                        <select className="form-field" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                            <option value="Mini">Mini</option>
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label>Kho (Tồn)</label>
                        <input className="form-field" type="number" value={stock} onChange={e => setStock(e.target.value)} />
                    </div>
                    <div className="form-input-group">
                        <label>Ảnh URL</label>
                        <input className="form-field" value={image} onChange={e => setImage(e.target.value)} placeholder="/assets/..." />
                    </div>
                </div>

                <div className="form-input-group">
                    <label>Mô tả chi tiết</label>
                    <textarea className="form-field" rows={4} value={desc} onChange={e => setDesc(e.target.value)}></textarea>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {editingId && <button className="btn outline" onClick={resetForm}>Hủy</button>}
                    <button className="btn primary" onClick={handleSubmit}>
                        {editingId ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                    </button>
                </div>
            </div>

            {/* Product List */}
            <div className="table-card">
                <table className="pro-table">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Giá</th>
                            <th>Kho</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <img src={p.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.slug}</div>
                                </td>
                                <td>{p.price.toLocaleString()} ₫</td>
                                <td>{p.stock}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="btn outline sm" onClick={() => handleEdit(p)} style={{ marginRight: '0.5rem' }}>
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button className="btn outline sm" onClick={() => { if (window.confirm('Xóa?')) deleteProduct(p.id); }} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
