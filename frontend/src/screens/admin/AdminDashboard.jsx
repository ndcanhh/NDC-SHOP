import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Row, Col, Card, Spinner, Alert, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { 
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
  FaDollarSign, FaShoppingCart, FaMobileAlt, FaUsers, 
  FaCalendarAlt, FaFilter, FaArrowUp, FaChartLine 
} from 'react-icons/fa';

const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#5a5c69', '#f8f9fc'];

const AdminDashboard = () => {
  const { userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [allUsers, setAllUsers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const get30DaysAgoStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(get30DaysAgoStr());
  const [endDate, setEndDate] = useState(getTodayStr());

  const [appliedStartDate, setAppliedStartDate] = useState(get30DaysAgoStr());
  const [appliedEndDate, setAppliedEndDate] = useState(getTodayStr());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const [{ data: users }, { data: orders }, { data: products }] = await Promise.all([
          axios.get('/api/users', config),
          axios.get('/api/orders', config),
          axios.get('/api/products')
        ]);
        setAllUsers(users);
        setAllOrders(orders);
        setAllProducts(products);
      } catch (err) {
        setError('Không thể tải báo cáo lúc này');
        console.error(err);
      }
      setLoading(false);
    };

    if (userInfo?.isAdmin) fetchDashboardData();
  }, [userInfo]);

  const processedData = useMemo(() => {
    if (!allOrders.length) return { hasData: false, stats: { users: allUsers.length, orders: 0, products: allProducts.length, revenue: '0 ₫' }, lineChartData: [], pieChartData: [], topProductsData: [], statusData: [], priceSegmentData: [] };

    const sDate = new Date(appliedStartDate); sDate.setHours(0,0,0,0);
    const eDate = new Date(appliedEndDate); eDate.setHours(23,59,59,999);

    const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

    // 1. Lọc đơn hàng theo ngày
    const validOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= sDate && d <= eDate;
    });

    const revenueOrders = validOrders.filter(o => !['Đã hủy', 'Chờ xử lý'].includes(o.status));
    const totalRev = revenueOrders.reduce((acc, o) => acc + o.totalPrice, 0);

    // 2. Biểu đồ Doanh thu & Đơn hàng theo ngày
    const dateMap = {};
    for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
       const dateStr = d.toISOString().split('T')[0];
       const [, month, day] = dateStr.split('-');
       dateMap[`${day}/${month}`] = { revenue: 0, orders: 0 };
    }

    revenueOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (dateMap[formattedDate]) {
        dateMap[formattedDate].revenue += o.totalPrice;
        dateMap[formattedDate].orders += 1;
      }
    });

    const lineData = Object.keys(dateMap).map(date => ({
      date,
      revenue: dateMap[date].revenue,
      orders: dateMap[date].orders
    }));

    // 3. Top 5 sản phẩm bán chạy
    const productSales = {};
    revenueOrders.forEach(o => {
      o.orderItems.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.qty;
      });
    });
    const topProducts = Object.keys(productSales)
      .map(name => ({ name, value: productSales[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 4. Trạng thái đơn hàng
    const statusCounts = {};
    validOrders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const statusData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));

    // 5. Phân khúc giá
    const segments = { 'Dưới 10tr': 0, '10tr - 20tr': 0, '20tr - 30tr': 0, 'Trên 30tr': 0 };
    revenueOrders.forEach(o => {
      o.orderItems.forEach(item => {
        const p = item.price;
        if (p < 10000000) segments['Dưới 10tr'] += item.qty;
        else if (p < 20000000) segments['10tr - 20tr'] += item.qty;
        else if (p < 30000000) segments['20tr - 30tr'] += item.qty;
        else segments['Trên 30tr'] += item.qty;
      });
    });
    const priceSegmentData = Object.keys(segments).map(name => ({ name, value: segments[name] }));

    // 6. Tỷ lệ theo hãng
    const brandSales = {};
    revenueOrders.forEach(o => {
      o.orderItems.forEach(item => {
        const p = allProducts.find(x => x._id === item.product);
        const b = p ? p.brand : 'Khác';
        brandSales[b] = (brandSales[b] || 0) + item.qty;
      });
    });
    const pieData = Object.keys(brandSales).map(name => ({ name, value: brandSales[name] }))
      .sort((a, b) => b.value - a.value);

    return {
      hasData: validOrders.length > 0,
      stats: { users: allUsers.length, orders: revenueOrders.length, products: allProducts.length, revenue: currencyFormatter.format(totalRev) },
      lineChartData: lineData,
      pieChartData: pieData,
      topProductsData: topProducts,
      statusData,
      priceSegmentData
    };
  }, [allOrders, allProducts, allUsers, appliedStartDate, appliedEndDate]);

  const { hasData, stats, lineChartData, pieChartData, topProductsData, statusData, priceSegmentData } = processedData;

  const renderStatCard = (title, value, icon, color, gradient) => (
    <Card className="border-0 shadow-sm overflow-hidden h-100 stat-card-modern" aria-label={`Thống kê ${title}`}>
      <div className={`p-1 ${gradient}`} style={{ opacity: 0.8 }} aria-hidden="true"></div>
      <Card.Body className="d-flex align-items-center p-4">
        <div className={`stat-icon-wrapper me-3 bg-light text-${color}`} aria-hidden="true">
          {icon}
        </div>
        <div>
          <div className="text-muted small fw-bold text-uppercase mb-1">{title}</div>
          <h4 className="fw-bold mb-0">{value}</h4>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <Spinner animation="border" variant="danger" />
    </div>
  );

  return (
    <div className="admin-dashboard-modern">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Tổng quan báo cáo</h3>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      {/* FILTER PANEL */}
      <Card className="border-0 shadow-sm mb-4 bg-white p-3 rounded-4">
        <Row className="align-items-center g-3">
          <Col md="auto" className="d-flex align-items-center gap-2 text-muted">
            <FaFilter /> <span className="fw-bold small text-uppercase">Bộ lọc:</span>
          </Col>
          <Col md={3}>
            <div className="input-group input-group-sm border rounded-3">
              <span className="input-group-text bg-white border-0"><FaCalendarAlt className="text-muted" /></span>
              <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-0" />
            </div>
          </Col>
          <Col md={3}>
            <div className="input-group input-group-sm border rounded-3">
              <span className="input-group-text bg-white border-0"><FaCalendarAlt className="text-muted" /></span>
              <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-0" />
            </div>
          </Col>
          <Col md="auto">
            <Button variant="danger" size="sm" className="px-4 rounded-pill fw-bold" onClick={() => { setAppliedStartDate(startDate); setAppliedEndDate(endDate); }}>Áp dụng</Button>
          </Col>
        </Row>
      </Card>

      {/* STAT CARDS */}
      <Row className="mb-4 g-3">
        <Col lg={3} sm={6}>
          {renderStatCard('Doanh thu', stats.revenue, <FaDollarSign />, 'primary', 'bg-primary')}
        </Col>
        <Col lg={3} sm={6}>
          {renderStatCard('Đơn hàng', `${stats.orders} đơn`, <FaShoppingCart />, 'success', 'bg-success')}
        </Col>
        <Col lg={3} sm={6}>
          {renderStatCard('Sản phẩm', `${stats.products} máy`, <FaMobileAlt />, 'info', 'bg-info')}
        </Col>
        <Col lg={3} sm={6}>
          {renderStatCard('Khách hàng', `${stats.users} user`, <FaUsers />, 'warning', 'bg-warning')}
        </Col>
      </Row>

      {!hasData ? (
        <Card className="border-0 shadow-sm p-5 text-center rounded-4">
          <div className="text-muted mb-3"><FaCalendarAlt size={48} opacity={0.3} /></div>
          <h5 className="fw-bold">Không có dữ liệu trong khoảng thời gian này</h5>
        </Card>
      ) : (
        <>
          <Row className="g-4 mb-4">
            {/* 1. Doanh thu & Đơn hàng */}
            <Col lg={12}>
              <Card className="border-0 shadow-sm rounded-4 p-4">
                <h6 className="fw-bold mb-4">Biểu đồ Doanh thu & Đơn hàng</h6>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={lineChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d70018" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#d70018" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize:11}} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize:11}} tickFormatter={v => v >= 1000000 ? `${v/1000000}tr` : `${v/1000}k`} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize:11}} />
                      <Tooltip formatter={(value, name) => [name === 'revenue' ? value.toLocaleString('vi-VN') + ' đ' : value, name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']} />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#d70018" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#1cc88a" strokeWidth={2} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            {/* 2. Top 5 Sản phẩm bán chạy */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                <h6 className="fw-bold mb-4 text-center">Top 5 Sản phẩm Bán chạy</h6>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsData} layout="vertical" margin={{ left: 40, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10, width: 100}} width={100} />
                      <Tooltip formatter={(value) => [value, 'Đã bán']} />
                      <Bar dataKey="value" fill="#d70018" radius={[0, 10, 10, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            {/* 3. Trạng thái Đơn hàng */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                <h6 className="fw-bold mb-4 text-center">Trạng thái Đơn hàng</h6>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Đơn hàng']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            {/* 4. Phân khúc Giá */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                <h6 className="fw-bold mb-4 text-center">Doanh số theo Phân khúc giá</h6>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={priceSegmentData} outerRadius={100} dataKey="value" label={({name, percent}) => `${name} (${(percent*100).toFixed(0)}%)`}>
                        {priceSegmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Đã bán']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            {/* 5. Tỷ lệ theo Hãng */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                <h6 className="fw-bold mb-4 text-center">Tỷ lệ Bán theo Hãng</h6>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Đã bán']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

