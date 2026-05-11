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

// Định nghĩa các tùy chọn RAM và ROM chuẩn
const RAM_OPTIONS = ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB', '32GB', '64GB'];
const ROM_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

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
    name: '', brand: '', discount: 0, description: '', isHidden: false,
    specs: { ram: '', rom: '', chip: '', battery: '' },
    tagsString: '',
    variants: []
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
        name: product.name, 
        brand: product.brand,
        discount: product.discount || 0, 
        description: product.description || '', 
        isHidden: product.isHidden || false,
        specs: product.specs || { ram: '', rom: '', chip: '', battery: '' },
        tagsString: product.tags ? product.tags.join(', ') : '',
        variants: product.variants || []
      });
    } else {
      setIsEditMode(false);
      setFormData({
        name: '', brand: '', discount: 0, description: '', isHidden: false,
        specs: { ram: '', rom: '', chip: '', battery: '' },
        tagsString: '',
        variants: [{ color: '', colorCode: '#000000', image: '', ram: '8GB', rom: '128GB', price: 0, countInStock: 0 }] 
      });
    }
    setShowModal(true);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (uploading) {
        toast.info('Vui lòng đợi ảnh tải lên hoàn tất!');
        return;
    }

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm!');
      return;
    }

    // Kiểm tra biến thể
    if (formData.variants.length === 0) {
        toast.error('Vui lòng thêm ít nhất một biến thể!');
        return;
    }

    for (const v of formData.variants) {
      if (!v.color?.trim() || !v.ram || !v.rom || !v.image) {
        toast.error('Vui lòng nhập đầy đủ thông tin (Màu, Ảnh, RAM, ROM) cho tất cả các biến thể!');
        return;
      }
      if (v.price <= 0) {
        toast.error(`Giá của biến thể "${v.color} - ${v.ram}/${v.rom}" phải lớn hơn 0!`);
        return;
      }
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const tagsArray = formData.tagsString
        ? formData.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];

      // Tự động tổng hợp RAM và ROM cho Specs
      const uniqueRams = [...new Set(formData.variants.map(v => (v.ram || '').trim()))].filter(r => r).sort().join(' / ');
      const uniqueRoms = [...new Set(formData.variants.map(v => (v.rom || '').trim()))].filter(r => r).sort().join(' / ');

      // Tự động lấy ảnh và giá của biến thể đầu tiên làm thông tin chính
      const mainImage = formData.variants[0].image;
      const mainPrice = formData.variants[0].price;
      const totalStock = formData.variants.reduce((sum, v) => sum + (v.countInStock || 0), 0);

      const submitData = { 
        ...formData, 
        image: mainImage,
        price: mainPrice,
        countInStock: totalStock,
        tags: tagsArray,
        specs: {
            ...formData.specs,
            ram: uniqueRams,
            rom: uniqueRoms
        }
      };

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
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || err.message || 'Lỗi không xác định');
    }
  };

  const uploadFileHandler = async (e, variantIdx) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', uploadData, config);
      
      const updated = [...formData.variants];
      updated[variantIdx] = { ...updated[variantIdx], image: data.url };
      setFormData({ ...formData, variants: updated });
      
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Không thể tải ảnh lên. Lỗi: ' + (error.response?.data?.message || error.message));
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
                <th className="py-3 d-none d-md-table-cell">Giá đại diện</th>
                <th className="py-3 text-center d-none d-lg-table-cell">Tổng tồn kho</th>
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
                    <div className="d-md-none text-danger small fw-bold">{p.price?.toLocaleString('vi-VN')} đ</div>
                  </td>
                  <td className="text-danger fw-bold d-none d-md-table-cell">{p.price?.toLocaleString('vi-VN')} đ</td>
                  <td className="text-center fw-medium d-none d-lg-table-cell">
                    {p.variants ? p.variants.reduce((sum, v) => sum + (v.countInStock || 0), 0) : 0}
                  </td>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered className="admin-modal">
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
                        <Form.Label className="small fw-bold text-muted">Hãng</Form.Label>
                        <Form.Control type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="rounded-3 border-light bg-light" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Mức giảm giá (%)</Form.Label>
                        <Form.Control type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} className="rounded-3 border-light bg-light" />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Tags (cách nhau bởi dấu phẩy)</Form.Label>
                        <Form.Control type="text" placeholder="VD: Hot, Mới, Gaming" value={formData.tagsString} onChange={(e) => setFormData({...formData, tagsString: e.target.value})} className="rounded-3 border-light bg-light" />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Chip xử lý</Form.Label>
                            <Form.Control type="text" value={formData.specs.chip} onChange={(e) => setFormData({...formData, specs: {...formData.specs, chip: e.target.value}})} className="rounded-3 border-light bg-light" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Dung lượng Pin</Form.Label>
                            <Form.Control type="text" value={formData.specs.battery} onChange={(e) => setFormData({...formData, specs: {...formData.specs, battery: e.target.value}})} className="rounded-3 border-light bg-light" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Mô tả sản phẩm</Form.Label>
                        <Form.Control as="textarea" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-3 border-light bg-light" placeholder="Nhập đặc điểm nổi bật..." />
                    </Form.Group>
                </Col>
             </Row>

             {/* DANH SÁCH BIẾN THỂ CHI TIẾT */}
             <div className="mt-4 pt-2">
               <div className="d-flex justify-content-between align-items-center mb-3">
                 <h6 className="fw-bold mb-0">Biến thể chi tiết (Màu sắc + Bộ nhớ)</h6>
                 <Button size="sm" variant="danger" className="rounded-pill px-3 shadow-sm" onClick={() => {
                   setFormData({ ...formData, variants: [...formData.variants, { color: '', colorCode: '#000000', image: '', ram: '8GB', rom: '128GB', price: 0, countInStock: 0 }] });
                 }}>+ Thêm biến thể</Button>
               </div>
               
               <Card className="border-0 bg-light rounded-4 overflow-hidden shadow-sm">
                 <Table hover responsive className="mb-0 align-middle bg-transparent" style={{ fontSize: '0.85rem' }}>
                    <thead className="bg-white">
                        <tr className="text-muted small fw-bold">
                            <th className="ps-3 py-3">Ảnh</th>
                            <th className="py-3">Màu sắc</th>
                            <th className="py-3" style={{ width: '100px' }}>RAM</th>
                            <th className="py-3" style={{ width: '100px' }}>ROM</th>
                            <th className="py-3" style={{ width: '150px' }}>Giá tiền (đ)</th>
                            <th className="py-3" style={{ width: '100px' }}>Tồn kho</th>
                            <th className="py-3 text-end pe-3">Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.variants.map((v, idx) => (
                            <tr key={idx} className="bg-white border-bottom border-light">
                                <td className="ps-3">
                                    <div 
                                        className="border rounded-3 p-1 text-center bg-light cursor-pointer position-relative d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ width: '45px', height: '45px', borderStyle: 'dashed' }}
                                        onClick={() => document.getElementById(`file-${idx}`).click()}
                                    >
                                        {v.image ? (
                                            <img src={v.image} alt="V" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <FaCloudUploadAlt className="text-muted fs-5" />
                                        )}
                                        <input type="file" id={`file-${idx}`} hidden onChange={(e) => uploadFileHandler(e, idx)} />
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex gap-2 align-items-center">
                                        <Form.Control size="sm" placeholder="Hồng" value={v.color} onChange={(e) => {
                                            const updated = [...formData.variants];
                                            updated[idx].color = e.target.value;
                                            setFormData({...formData, variants: updated});
                                        }} className="rounded-2" />
                                        <Form.Control type="color" size="sm" value={v.colorCode} style={{ width: '30px', height: '30px', padding: '2px' }} 
                                            onChange={(e) => {
                                                const updated = [...formData.variants];
                                                updated[idx].colorCode = e.target.value;
                                                setFormData({...formData, variants: updated});
                                            }} className="rounded-circle border-0" />
                                    </div>
                                </td>
                                <td>
                                    <Form.Select size="sm" value={v.ram} className="rounded-2" onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[idx].ram = e.target.value;
                                        setFormData({...formData, variants: updated});
                                    }}>
                                        {RAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Select size="sm" value={v.rom} className="rounded-2" onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[idx].rom = e.target.value;
                                        setFormData({...formData, variants: updated});
                                    }}>
                                        {ROM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Control size="sm" type="number" value={v.price} className="rounded-2 fw-bold text-danger" onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[idx].price = Number(e.target.value);
                                        setFormData({...formData, variants: updated});
                                    }} />
                                </td>
                                <td>
                                    <Form.Control size="sm" type="number" value={v.countInStock} className="rounded-2" onChange={(e) => {
                                        const updated = [...formData.variants];
                                        updated[idx].countInStock = Number(e.target.value);
                                        setFormData({...formData, variants: updated});
                                    }} />
                                </td>
                                <td className="text-end pe-3">
                                    <Button variant="link" className="text-danger p-0" onClick={() => {
                                        const updated = formData.variants.filter((_, i) => i !== idx);
                                        setFormData({...formData, variants: updated});
                                    }}>
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </Table>
               </Card>
               {uploading && <div className="text-center mt-2 small text-muted"><Spinner animation="border" size="sm" className="me-2" /> Đang tải ảnh lên...</div>}
             </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 p-4">
            <Button variant="light" className="px-4 rounded-pill fw-bold" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="danger" type="submit" className="px-4 rounded-pill fw-bold" disabled={uploading}>
                {uploading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductListScreen;
