import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { toast } from 'react-toastify';

import { 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaEyeSlash, 
  FaTrash, 
  FaCloudUploadAlt 
} from 'react-icons/fa';

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
    name: '', price: 0, image: '', brand: '', discount: 0, description: '', isHidden: false,
    specs: { ram: '', rom: '', chip: '', battery: '' },
    tagsString: '',
    colorVariants: [],
    storageVariants: []
  });

  const [refreshList, setRefreshList] = useState(false);

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    axios.get('/api/products/admin/all', config)
      .then(({ data }) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [refreshList, userInfo.token]);

  const deleteHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        toast.success('Đã xóa sản phẩm!');
        setRefreshList(!refreshList);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  const toggleHideHandler = async (product) => {
    if (window.confirm(`Bạn có chắc muốn ${product.isHidden ? 'HIỆN' : 'ẨN'} sản phẩm này không?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const updatedData = { ...product, isHidden: !product.isHidden };
        await axios.put(`/api/products/${product._id}`, updatedData, config);
        setRefreshList(!refreshList);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setIsEditMode(true);
      setCurrentId(product._id);
      setFormData({
        name: product.name, price: product.price, image: product.image, brand: product.brand,
        discount: product.discount || 0, description: product.description || '', isHidden: product.isHidden || false,
        specs: product.specs || { ram: '', rom: '', chip: '', battery: '' },
        tagsString: product.tags ? product.tags.join(', ') : '',
        colorVariants: product.colorVariants || [],
        storageVariants: product.storageVariants || []
      });
    } else {
      setIsEditMode(false);
      setFormData({
        name: '', price: 0, image: '/images/sample.jpg', brand: '', discount: 0, description: '', isHidden: false,
        specs: { ram: '', rom: '', chip: '', battery: '' },
        tagsString: '',
        colorVariants: [],
        storageVariants: []
      });
    }
    setShowModal(true);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm!');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Giá gốc sản phẩm phải lớn hơn 0!');
      return;
    }

    // Kiểm tra biến thể
    for (const sv of formData.storageVariants) {
      if (sv.price <= 0) {
        toast.error(`Giá của phiên bản "${sv.label}" phải lớn hơn 0!`);
        return;
      }
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // Xử lý tags: cắt chuỗi theo dấu phẩy, xóa khoảng trắng thừa, loại bỏ các tag rỗng
      const tagsArray = formData.tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const submitData = { ...formData, tags: tagsArray };

      if (isEditMode) {
        await axios.put(`/api/products/${currentId}`, submitData, config);
        toast.success('Cập nhật thành công!');
      } else {
        await axios.post('/api/products', submitData, config);
        toast.success('Đã thêm sản phẩm mới!');
      }
      setShowModal(false);
      setRefreshList(!refreshList);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const uploadFileHandler = async (e, colorIdx = null) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', uploadData, config);
      
      if (colorIdx !== null) {
        const updated = [...formData.colorVariants];
        updated[colorIdx] = { ...updated[colorIdx], image: data.url };
        setFormData({ ...formData, colorVariants: updated });
      } else {
        setFormData({ ...formData, image: data.url });
      }
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Không thể tải ảnh lên. Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFileHandler({ target: { files: [file] } });
    }
  };

  const onDropColor = (e, idx) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFileHandler({ target: { files: [file] } }, idx);
    }
  };

  return (
    <div className="admin-product-list">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold mb-0">Danh sách sản phẩm</h3>
        </Col>
        <Col className="text-end">
          <Button 
            variant="danger" 
            className="rounded-circle shadow-sm p-0 d-inline-flex align-items-center justify-content-center" 
            style={{ width: '45px', height: '45px' }}
            onClick={() => handleShowModal()}
            title="Thêm sản phẩm mới"
          >
             <FaPlus className="fs-5" />
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="text-muted small text-uppercase fw-bold">
                <th className="ps-4 py-3">Hình ảnh</th>
                <th className="py-3">Tên sản phẩm</th>
                <th className="py-3 d-none d-md-table-cell">Giá gốc</th>
                <th className="py-3 text-center d-none d-lg-table-cell">Tồn kho</th>
                <th className="py-3 text-center d-none d-md-table-cell">Trạng thái</th>
                <th className="py-3 text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="ps-4">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px' }}
                      className="shadow-sm border border-light"
                    />
                  </td>
                  <td>
                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '150px' }}>{p.name}</div>
                    <div className="d-md-none text-danger small fw-bold">{p.price.toLocaleString('vi-VN')} đ</div>
                  </td>
                  <td className="text-danger fw-bold d-none d-md-table-cell">{p.price.toLocaleString('vi-VN')} đ</td>
                  <td className="text-center fw-medium d-none d-lg-table-cell">{p.storageVariants ? p.storageVariants.reduce((sum, v) => sum + (v.countInStock || 0), 0) : 0}</td>
                  <td className="text-center d-none d-md-table-cell">
                    {p.isHidden ? (
                      <span className="badge rounded-pill bg-light text-danger border border-danger-subtle px-3">Đã ẩn</span>
                    ) : (
                      <span className="badge rounded-pill bg-light text-success border border-success-subtle px-3">Đang bán</span>
                    )}
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-1 gap-md-2">
                      <Button variant="outline-primary" className="btn-sm border-0 bg-light rounded-3 p-2" onClick={() => handleShowModal(p)} title="Sửa">
                        <FaEdit />
                      </Button>
                      <Button 
                        variant={p.isHidden ? "outline-success" : "outline-warning"} 
                        className="btn-sm border-0 bg-light rounded-3 p-2 d-none d-sm-inline-block" 
                        onClick={() => toggleHideHandler(p)}
                        title={p.isHidden ? 'Hiện' : 'Ẩn'}
                      >
                        {p.isHidden ? <FaEye /> : <FaEyeSlash />}
                      </Button>
                      <Button variant="outline-danger" className="btn-sm border-0 bg-light rounded-3 p-2" onClick={() => deleteHandler(p._id)} title="Xóa">
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modal Thêm/Sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="admin-modal">
        <Form onSubmit={submitHandler}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">{isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
             <Row className="g-4">
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Tên sản phẩm</Form.Label>
                        <Form.Control type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-3 border-light bg-light" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Giá nguyên bản (đ)</Form.Label>
                        <Form.Control type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="rounded-3 border-light bg-light" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Hình ảnh sản phẩm</Form.Label>
                        <div 
                          className="image-upload-dropzone border-2 border-dashed rounded-4 p-4 text-center bg-light mb-2 cursor-pointer"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={onDrop}
                          onClick={() => document.getElementById('imageFile').click()}
                          style={{ borderColor: '#dee2e6' }}
                        >
                          {uploading ? (
                            <Spinner animation="border" size="sm" variant="danger" />
                          ) : formData.image ? (
                            <div className="position-relative d-inline-block">
                              <img src={formData.image} alt="" style={{ height: '80px', borderRadius: '8px' }} />
                              <div className="small text-muted mt-2">Kéo thả hoặc nhấn để đổi ảnh</div>
                            </div>
                          ) : (
                            <div className="py-2">
                              <FaCloudUploadAlt className="fs-2 text-muted mb-2" />
                              <div className="small text-muted">Kéo thả ảnh vào đây hoặc nhấn để chọn file</div>
                            </div>
                          )}
                          <input type="file" id="imageFile" hidden onChange={uploadFileHandler} />
                        </div>
                        <Form.Control type="text" placeholder="Hoặc nhập link ảnh trực tiếp" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="rounded-3 border-light bg-light form-control-sm" />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Hãng</Form.Label>
                        <Form.Control type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="rounded-3 border-light bg-light" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Tags (cách nhau bởi dấu phẩy)</Form.Label>
                        <Form.Control type="text" placeholder="VD: Hot, Mới, Gaming" value={formData.tagsString} onChange={(e) => setFormData({...formData, tagsString: e.target.value})} className="rounded-3 border-light bg-light" />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">RAM</Form.Label>
                            <Form.Control type="text" value={formData.specs.ram} onChange={(e) => setFormData({...formData, specs: {...formData.specs, ram: e.target.value}})} className="rounded-3 border-light bg-light" />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">ROM</Form.Label>
                            <Form.Control type="text" value={formData.specs.rom} onChange={(e) => setFormData({...formData, specs: {...formData.specs, rom: e.target.value}})} className="rounded-3 border-light bg-light" />
                        </Form.Group>
                      </Col>
                    </Row>
                </Col>
             </Row>

             <div className="mt-4 pt-2">
               <div className="d-flex justify-content-between align-items-center mb-3">
                 <h6 className="fw-bold mb-0">Biến thể màu sắc</h6>
                 <Button size="sm" variant="outline-danger" className="rounded-pill px-3 border-0 bg-light" onClick={() => {
                   setFormData({ ...formData, colorVariants: [...formData.colorVariants, { color: '', colorCode: '#000000', image: '' }] });
                 }}>+ Thêm màu</Button>
               </div>
               <div className="bg-light p-3 rounded-4">
                 {formData.colorVariants.length === 0 && <div className="text-center text-muted small py-2">Chưa có biến thể màu sắc nào</div>}
                 {formData.colorVariants.map((cv, idx) => (
                   <div key={idx} className="mb-3 p-3 border-0 bg-white rounded-3 shadow-sm">
                     <Row className="g-2 align-items-center">
                       <Col md={3}>
                         <Form.Label className="smaller text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Tên màu</Form.Label>
                         <Form.Control size="sm" placeholder="VD: Titan Sa Mạc" value={cv.color} className="rounded-2 border-light bg-light"
                           onChange={(e) => {
                             const updated = [...formData.colorVariants];
                             updated[idx] = { ...updated[idx], color: e.target.value };
                             setFormData({ ...formData, colorVariants: updated });
                           }} />
                       </Col>
                       <Col md={2}>
                         <Form.Label className="smaller text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Mã màu</Form.Label>
                         <Form.Control size="sm" type="color" value={cv.colorCode || '#000000'} className="rounded-2 w-100 border-0 p-1 bg-light" style={{ height: '31px' }}
                           onChange={(e) => {
                             const updated = [...formData.colorVariants];
                             updated[idx] = { ...updated[idx], colorCode: e.target.value };
                             setFormData({ ...formData, colorVariants: updated });
                           }} />
                       </Col>
                       <Col md={5}>
                         <Form.Label className="smaller text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Ảnh</Form.Label>
                         <div 
                           className="border rounded-2 p-1 text-center bg-light cursor-pointer position-relative d-flex align-items-center justify-content-center"
                           style={{ height: '31px', fontSize: '0.65rem', borderStyle: 'dashed', borderColor: '#dee2e6' }}
                           onDragOver={(e) => e.preventDefault()}
                           onDrop={(e) => onDropColor(e, idx)}
                           onClick={() => document.getElementById(`colorFile-${idx}`).click()}
                         >
                           {cv.image ? (
                             <>
                               <img src={cv.image} alt="Color" style={{ height: '20px', borderRadius: '4px' }} className="me-2" />
                               <span className="text-truncate">Đã có ảnh</span>
                             </>
                           ) : (
                             <span className="text-muted"><FaCloudUploadAlt /> Kéo/Nhấn</span>
                           )}
                           <input type="file" id={`colorFile-${idx}`} hidden onChange={(e) => uploadFileHandler(e, idx)} />
                         </div>
                       </Col>
                       <Col md={2} className="text-end">
                         <Form.Label className="smaller text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Xóa</Form.Label>
                         <Button size="sm" variant="link" className="text-danger p-0" onClick={() => {
                           const updated = formData.colorVariants.filter((_, i) => i !== idx);
                           setFormData({ ...formData, colorVariants: updated });
                         }}><FaTrash /></Button>
                       </Col>
                     </Row>
                     <Form.Control size="sm" type="text" placeholder="Hoặc dán link ảnh trực tiếp" value={cv.image} className="mt-2 rounded-2 border-0 bg-light" style={{ fontSize: '0.7rem' }}
                       onChange={(e) => {
                         const updated = [...formData.colorVariants];
                         updated[idx] = { ...updated[idx], image: e.target.value };
                         setFormData({ ...formData, colorVariants: updated });
                       }} />
                   </div>
                 ))}
               </div>
             </div>

             {/* Biến thể RAM/ROM */}
             <div className="mt-4 pt-2">
               <div className="d-flex justify-content-between align-items-center mb-3">
                 <h6 className="fw-bold mb-0">Biến thể RAM/ROM</h6>
                 <Button size="sm" variant="outline-danger" className="rounded-pill px-3 border-0 bg-light" onClick={() => {
                   setFormData({ ...formData, storageVariants: [...formData.storageVariants, { label: '', price: 0, countInStock: 0 }] });
                 }}>+ Thêm phiên bản</Button>
               </div>
               <div className="bg-light p-3 rounded-4">
                 {formData.storageVariants.length === 0 && <div className="text-center text-muted small py-2">Chưa có biến thể bộ nhớ nào</div>}
                 {formData.storageVariants.map((sv, idx) => (
                   <Row key={idx} className="mb-2 g-2 align-items-center">
                     <Col md={4}>
                       <Form.Control size="sm" placeholder="VD: 8GB/128GB" value={sv.label} className="rounded-3 border-0 shadow-sm"
                         onChange={(e) => {
                           const updated = [...formData.storageVariants];
                           updated[idx] = { ...updated[idx], label: e.target.value };
                           setFormData({ ...formData, storageVariants: updated });
                         }} />
                     </Col>
                     <Col md={3}>
                       <Form.Control size="sm" type="number" placeholder="Giá" value={sv.price} className="rounded-3 border-0 shadow-sm"
                         onChange={(e) => {
                           const updated = [...formData.storageVariants];
                           updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                           setFormData({ ...formData, storageVariants: updated });
                         }} />
                     </Col>
                     <Col md={3}>
                       <Form.Control size="sm" type="number" placeholder="Tồn" value={sv.countInStock} className="rounded-3 border-0 shadow-sm"
                         onChange={(e) => {
                           const updated = [...formData.storageVariants];
                           updated[idx] = { ...updated[idx], countInStock: Number(e.target.value) };
                           setFormData({ ...formData, storageVariants: updated });
                         }} />
                     </Col>
                     <Col md={2} className="text-end">
                       <Button size="sm" variant="link" className="text-danger p-0" onClick={() => {
                         const updated = formData.storageVariants.filter((_, i) => i !== idx);
                         setFormData({ ...formData, storageVariants: updated });
                       }}><FaTrash /></Button>
                     </Col>
                   </Row>
                 ))}
               </div>
             </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 p-4">
            <Button variant="light" className="px-4 rounded-pill fw-bold" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="danger" type="submit" className="px-4 rounded-pill fw-bold">Lưu thay đổi</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductListScreen;
