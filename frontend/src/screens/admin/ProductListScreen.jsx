import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';

const ProductListScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Trạng thái cho Modal Sửa/Thêm
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({
    name: '', price: 0, image: '', brand: '', countInStock: 0, discount: 0, description: '',
    specs: { ram: '', rom: '', chip: '', battery: '' }
  });

  const [refreshList, setRefreshList] = useState(false);

  useEffect(() => {
    axios.get('/api/products')
      .then(({ data }) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [refreshList]);

  const deleteHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        alert('Đã xóa sản phẩm!');
        setRefreshList(!refreshList);
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setIsEditMode(true);
      setCurrentId(product._id);
      setFormData({
        name: product.name, price: product.price, image: product.image, brand: product.brand,
        countInStock: product.countInStock, discount: product.discount || 0, description: product.description || '',
        specs: product.specs || { ram: '', rom: '', chip: '', battery: '' }
      });
    } else {
      setIsEditMode(false);
      setFormData({
        name: '', price: 0, image: '/images/sample.jpg', brand: '', countInStock: 0, discount: 0, description: '',
        specs: { ram: '', rom: '', chip: '', battery: '' }
      });
    }
    setShowModal(true);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      if (isEditMode) {
        await axios.put(`/api/products/${currentId}`, formData, config);
        alert('Cập nhật thành công!');
      } else {
        await axios.post('/api/products', formData, config);
        alert('Đã thêm sản phẩm mới!');
      }
      setShowModal(false);
      setRefreshList(!refreshList);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', uploadData, config);
      
      setFormData({ ...formData, image: data.url });
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert('Không thể tải ảnh lên. Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Danh sách Sản phẩm</h2>
        </Col>
        <Col className="text-end">
          <Button className="my-3 buy-btn" onClick={() => handleShowModal()}>
             <i className="fa-solid fa-plus"></i> Thêm sản phẩm
          </Button>
        </Col>
      </Row>

      {loading ? <Spinner animation="border" /> : error ? <Alert variant="danger">{error}</Alert> : (
        <Table striped bordered hover responsive className="table-sm text-center align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>TÊN</th>
              <th>GIÁ GỐC</th>
              <th>TỒN KHO</th>
              <th>GIẢM GIÁ</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p._id}</td>
                <td>{p.name}</td>
                <td className="text-brand-red fw-bold">{p.price.toLocaleString('vi-VN')} đ</td>
                <td>{p.countInStock} cái</td>
                <td>{p.discount || 0}%</td>
                <td>
                  <Button variant="light" className="btn-sm me-2 border" onClick={() => handleShowModal(p)}>
                    Sửa
                  </Button>
                  <Button variant="danger" className="btn-sm" onClick={() => deleteHandler(p._id)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Thêm/Sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form onSubmit={submitHandler}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditMode ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm Mới'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên sản phẩm</Form.Label>
                        <Form.Control type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Giá nguyên bản (đ)</Form.Label>
                        <Form.Control type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Hình ảnh Sản phẩm</Form.Label>
                        <Form.Control type="text" placeholder="Nhập Link Ảnh hoặc tải file dưới đây" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="mb-2" />
                        <Form.Control type="file" label="Chọn ảnh tải lên" onChange={uploadFileHandler} />
                        {uploading && <Spinner animation="border" size="sm" className="mt-2 text-primary" />}
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Hãng</Form.Label>
                        <Form.Control type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Tồn kho</Form.Label>
                        <Form.Control type="number" value={formData.countInStock} onChange={(e) => setFormData({...formData, countInStock: Number(e.target.value)})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>Giảm giá (%)</Form.Label>
                        <Form.Control type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>RAM</Form.Label>
                        <Form.Control type="text" value={formData.specs.ram} onChange={(e) => setFormData({...formData, specs: {...formData.specs, ram: e.target.value}})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                        <Form.Label>ROM</Form.Label>
                        <Form.Control type="text" value={formData.specs.rom} onChange={(e) => setFormData({...formData, specs: {...formData.specs, rom: e.target.value}})} />
                        </Form.Group>
                    </Col>
                 </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
            <Button variant="danger" type="submit">Lưu thay đổi</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ProductListScreen;
