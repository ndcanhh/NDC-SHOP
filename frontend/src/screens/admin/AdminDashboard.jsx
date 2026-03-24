import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/authContextValue';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { userInfo } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    revenue: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        // Lấy tất cả dữ liệu
        const { data: users } = await axios.get('/api/users', config);
        const { data: orders } = await axios.get('/api/orders', config);
        const { data: products } = await axios.get('/api/products');

        // Tính tổng doanh thu từ các đơn hàng đã thanh toán hoặc đang giao
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        setStats({
          users: users.length,
          orders: orders.length,
          products: products.length,
          revenue: totalRevenue,
        });

        // Xử lý dữ liệu biểu đồ: Doanh thu 7 ngày gần nhất
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          // Lấy chênh lệch múi giờ ở VN
          return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        }).reverse();
        
        const aggregated = last7Days.map(dateStr => {
           // Lọc đơn hàng thuộc ngày này (createdAt bắt đầu bằng chuỗi YYYY-MM-DD)
           const dailyOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
           const dailyRev = dailyOrders.reduce((acc, o) => acc + o.totalPrice, 0);
           
           // Chuyển YYYY-MM-DD thành DD/MM
           const [, month, day] = dateStr.split('-');
           return {
              date: `${day}/${month}`,
              revenue: dailyRev
           };
        });
        setChartData(aggregated);

      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
      setLoading(false);
    };

    if (userInfo && userInfo.isAdmin) {
      fetchDashboardData();
    }
  }, [userInfo]);

  const maxRev = Math.max(...chartData.map(d => d.revenue), 1) * 1.1; // * 1.1 để chừa khoảng trống trên đỉnh cột

  return (
    <>
      <h2 className="mb-4">Bảng điều khiển (Dashboard)</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center shadow-sm text-white bg-primary border-0 rounded-3">
                <Card.Body>
                  <Card.Title>Doanh thu</Card.Title>
                  <h3 className="fw-bold">{stats.revenue.toLocaleString('vi-VN')} đ</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center shadow-sm text-white bg-success border-0 rounded-3">
                <Card.Body>
                  <Card.Title>Đơn hàng</Card.Title>
                  <h3 className="fw-bold">{stats.orders} đơn</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center shadow-sm text-white bg-info border-0 rounded-3">
                <Card.Body>
                  <Card.Title>Sản phẩm</Card.Title>
                  <h3 className="fw-bold">{stats.products} máy</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center shadow-sm text-white bg-warning border-0 rounded-3">
                <Card.Body>
                  <Card.Title>Khách hàng</Card.Title>
                  <h3 className="fw-bold">{stats.users} user</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="shadow-sm border-0 rounded-3 p-3">
                <Card.Body>
                  <Card.Title className="fw-bold mb-4 text-brand-red">Biểu đồ Doanh thu (7 ngày gần nhất)</Card.Title>
                  <div style={{ height: '350px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#333', fontSize: 13 }} tickMargin={10} />
                        <YAxis 
                          domain={[0, maxRev]}
                          tickFormatter={(value) => `${(value / 1000000)}tr`} 
                          tick={{ fill: '#333', fontSize: 13 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value.toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                          cursor={{ fill: 'rgba(238, 77, 45, 0.1)' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="#ee4d2d" 
                          radius={[4, 4, 0, 0]} 
                          barSize={40}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default AdminDashboard;
