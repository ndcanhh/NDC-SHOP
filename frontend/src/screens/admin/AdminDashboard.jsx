import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Row, Col, Card, Spinner, Alert, Form, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom colors cho biểu đồ tròn (Pie Chart)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#d0ed57', '#a4de6c'];

const AdminDashboard = () => {
  const { userInfo } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dữ liệu gốc từ API
  const [allUsers, setAllUsers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Lấy ngày hiện tại và 30 ngày trước làm giá trị mặc định
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const get30DaysAgoStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(get30DaysAgoStr());
  const [endDate, setEndDate] = useState(getTodayStr());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        const { data: users } = await axios.get('/api/users', config);
        const { data: orders } = await axios.get('/api/orders', config);
        const { data: products } = await axios.get('/api/products');

        setAllUsers(users);
        setAllOrders(orders);
        setAllProducts(products);

      } catch (err) {
        setError('Không thể tải báo cáo lúc này, vui lòng thử lại');
        console.error('Fetch dashboard error:', err);
      }
      setLoading(false);
    };

    if (userInfo && userInfo.isAdmin) {
      fetchDashboardData();
    }
  }, [userInfo]);

  const processedData = useMemo(() => {
    if (allOrders.length === 0 && allProducts.length === 0) {
      return {
        hasData: true,
        stats: { users: 0, orders: 0, products: 0, revenue: 0 },
        lineChartData: [],
        pieChartData: []
      };
    }

    const sDate = new Date(startDate);
    sDate.setHours(0, 0, 0, 0);
    
    const eDate = new Date(endDate);
    eDate.setHours(23, 59, 59, 999);

    const validOrders = allOrders.filter(order => {
      // Chỉ tính doanh thu từ những đơn đã xử lý (đã gửi đi, đang giao hoặc hoàn thành)
      // Bỏ qua đơn 'Chờ xử lý' và đơn 'Đã hủy'
      const excludedStatuses = ['Đã hủy', 'Chờ xử lý'];
      if (excludedStatuses.includes(order.status)) return false;

      const orderDate = new Date(order.createdAt);
      return orderDate >= sDate && orderDate <= eDate;
    });

    const totalRev = validOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    const calculatedStats = {
      users: allUsers.length,
      products: allProducts.length,
      orders: validOrders.length,
      revenue: totalRev,
    };

    if (validOrders.length === 0) {
      return { hasData: false, stats: calculatedStats, lineChartData: [], pieChartData: [] };
    }

    const dateMap = {};
    for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
       const dateStr = d.toISOString().split('T')[0];
       const [, month, day] = dateStr.split('-');
       dateMap[`${day}/${month}`] = { revenue: 0, orders: 0 };
    }

    validOrders.forEach(order => {
      const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
      const [, month, day] = orderDateStr.split('-');
      const formattedDate = `${day}/${month}`;
      if (dateMap[formattedDate] !== undefined) {
        dateMap[formattedDate].revenue += order.totalPrice;
        dateMap[formattedDate].orders += 1;
      }
    });

    const lineData = Object.keys(dateMap).map(date => ({
      date,
      revenue: dateMap[date].revenue,
      orders: dateMap[date].orders
    }));

    const brandSales = {};
    validOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const productInfo = allProducts.find(p => p._id === item.product);
        const brand = productInfo ? productInfo.brand : 'Khác';
        
        if (!brandSales[brand]) brandSales[brand] = 0;
        brandSales[brand] += item.qty;
      });
    });

    const pieData = Object.keys(brandSales).map(brand => ({
      name: brand,
      value: brandSales[brand]
    })).sort((a, b) => b.value - a.value);

    return {
      hasData: true,
      stats: calculatedStats,
      lineChartData: lineData,
      pieChartData: pieData
    };
  }, [allOrders, allProducts, allUsers, startDate, endDate]);

  const { hasData, stats, lineChartData, pieChartData } = processedData;

  const maxRev = Math.max(...(lineChartData.map(d => d.revenue) || []), 1) * 1.1;
  const maxOrders = Math.max(...(lineChartData.map(d => d.orders) || []), 1) + 2;

  // Custom Label cho PieChart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      <h2 className="mb-4">Bảng điều khiển (Dashboard)</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {/* Bộ lọc thời gian */}
          <Card className="mb-4 shadow-sm border-0 bg-light p-3">
            <Form className="d-flex align-items-end gap-3">
              <Form.Group>
                <Form.Label className="mb-1 text-muted small fw-bold">Từ ngày</Form.Label>
                <Form.Control 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="mb-1 text-muted small fw-bold">Đến ngày</Form.Label>
                <Form.Control 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </Form.Group>
              <Button variant="danger" disabled className="opacity-75">
                Đang lọc tự động...
              </Button>
            </Form>
          </Card>

          {/* Các thẻ Thống kê (Chỉ hiển thị Doanh thu & Đơn hàng theo bộ lọc, Users & Products là tổng số hệ thống) */}
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center shadow-sm text-white bg-primary border-0 rounded-3">
                <Card.Body>
                  <Card.Title>Doanh thu (Lọc)</Card.Title>
                  <h3 className="fw-bold">{stats.revenue.toLocaleString('vi-VN')} đ</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center shadow-sm text-white bg-success border-0 rounded-3">
                <Card.Body>
                  <Card.Title>Đơn hàng (Lọc)</Card.Title>
                  <h3 className="fw-bold">{stats.orders} đơn</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center shadow-sm text-white bg-info border-0 rounded-3">
                <Card.Body>
                  <Card.Title>Tổng Sản phẩm</Card.Title>
                  <h3 className="fw-bold">{stats.products} máy</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center shadow-sm text-white bg-warning border-0 rounded-3">
                <Card.Body>
                  <Card.Title>Tổng Khách hàng</Card.Title>
                  <h3 className="fw-bold">{stats.users} user</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* E1: Xử lý khi không có dữ liệu */}
          {!hasData ? (
             <Alert variant="warning" className="text-center py-4">
               <strong>Không có dữ liệu thống kê cho khoảng thời gian này.</strong>
             </Alert>
          ) : (
            <Row>
              {/* Biểu đồ 1: Doanh thu */}
              <Col lg={4} md={6} className="mb-4">
                <Card className="shadow-sm border-0 rounded-3 p-3 h-100">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-4 text-brand-red small">Doanh thu</Card.Title>
                    <div style={{ height: '280px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis 
                            domain={[0, maxRev]} 
                            tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}tr` : `${(v / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                          />
                          <Tooltip 
                            formatter={(v) => [`${v.toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          />
                          <Line type="monotone" dataKey="revenue" stroke="#ee4d2d" strokeWidth={2} dot={{ r: 3, fill: '#ee4d2d' }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Biểu đồ 2: Số đơn hàng */}
              <Col lg={4} md={6} className="mb-4">
                <Card className="shadow-sm border-0 rounded-3 p-3 h-100">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-4 text-success small">Số đơn hàng</Card.Title>
                    <div style={{ height: '280px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis 
                            domain={[0, maxOrders]} 
                            allowDecimals={false}
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                          />
                          <Tooltip 
                            formatter={(v) => [`${v} đơn`, 'Số đơn']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          />
                          <Line type="monotone" dataKey="orders" stroke="#28a745" strokeWidth={2} dot={{ r: 3, fill: '#28a745' }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Biểu đồ 3: Hãng bán chạy */}
              <Col lg={4} md={12} className="mb-4">
                <Card className="shadow-sm border-0 rounded-3 p-3 h-100">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-4 text-primary small">Tỷ lệ theo Hãng</Card.Title>
                    <div style={{ height: '280px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            animationDuration={1000}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} máy`, 'Số lượng']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </>
  );
};

export default AdminDashboard;
