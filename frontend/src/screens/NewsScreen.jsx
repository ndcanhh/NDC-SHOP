import React from 'react';
import { Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { FaCalendarAlt, FaTag } from 'react-icons/fa';
import { optimizeCloudinaryUrl } from '../utils/imageUtils';


const newsData = [
  {
    id: 1,
    title: 'iPhone 17 Pro Max: Siêu phẩm nhiếp ảnh 2025 chính thức ra mắt',
    category: 'Tin tức Apple',
    date: '01/03/2025',
    desc: 'Apple vừa ra mắt dòng iPhone 17 với thiết kế Aluminum mới, camera 48MP cải tiến và chip A19 Pro mạnh mẽ nhất từ trước đến nay. Đặc biệt tính năng Apple Intelligence thế hệ 2 hứa hẹn mang lại trải nghiệm AI đột phá.',
    tag: 'Mới',
    tagColor: 'danger',
  },
  {
    id: 2,
    title: 'Samsung Galaxy S25 Ultra: "Vua" Android đáng mua nhất 2025',
    category: 'Tin tức Samsung',
    date: '15/02/2025',
    desc: 'Samsung Galaxy S25 Ultra với Snapdragon 8 Elite, S-Pen tích hợp và camera 200MP AI đang làm mưa làm gió thị trường. Đánh giá chi tiết từ NDC SHOP sau 1 tháng sử dụng thực tế.',
    tag: 'Đánh giá',
    tagColor: 'primary',
  },
  {
    id: 3,
    title: 'So sánh Xiaomi 16 Ultra vs Galaxy S25 Ultra: Cuộc chiến camera 200MP',
    category: 'So sánh',
    date: '20/02/2025',
    desc: 'Hai siêu phẩm camera của năm 2025 đối đầu nhau trong bài kiểm tra toàn diện: ảnh ban ngày, ban đêm, quay video 8K và hiệu năng gaming. Kết quả có thể khiến bạn bất ngờ!',
    tag: 'So sánh',
    tagColor: 'warning',
  },
  {
    id: 4,
    title: 'Mua điện thoại trả góp 0% lãi suất tại NDC SHOP tháng 3/2025',
    category: 'Khuyến mãi',
    date: '28/02/2025',
    desc: 'NDC SHOP hợp tác với 10 ngân hàng lớn, hỗ trợ trả góp 0% lãi suất 12-24 tháng cho toàn bộ sản phẩm iPhone, Samsung, Xiaomi. Thủ tục đơn giản, duyệt trong 15 phút.',
    tag: 'Khuyến mãi',
    tagColor: 'success',
  },
  {
    id: 5,
    title: 'Top 5 điện thoại dưới 5 triệu đáng mua nhất tháng 3/2025',
    category: 'Tư vấn',
    date: '27/02/2025',
    desc: 'Ngân sách hạn hẹp không có nghĩa là phải chấp nhận điện thoại kém chất lượng. NDC SHOP tổng hợp 5 mẫu điện thoại tầm giá dưới 5 triệu đồng với hiệu năng tốt nhất hiện nay.',
    tag: 'Tư vấn',
    tagColor: 'info',
  },
  {
    id: 6,
    title: 'Xiaomi 16 Ultra mỏng hơn — Leica nâng cấp lên 5 ống kính 50MP',
    category: 'Tin tức Xiaomi',
    date: '25/02/2025',
    desc: 'Xiaomi 16 Ultra được trang bị 5 ống kính Leica 50MP, bao gồm zoom quang 10x và ống kính chân dung f/1.4. Sạc 200W đầy pin trong 15 phút. Đây có phải là điện thoại camera tốt nhất 2025?',
    tag: 'Hot',
    tagColor: 'danger',
  },
];

const NewsScreen = () => {
  const [newsList, setNewsList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get('/api/news');
        // Nếu DB có dữ liệu thì dùng, không thì fallback về newsData mẫu
        setNewsList(data.length > 0 ? data : newsData);
      } catch (err) {
        console.error('Lỗi tải tin tức:', err);
        setNewsList(newsData); // Fallback khi lỗi
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  return (
    <div className="news-page py-4">
      <h3 className="mb-4 ps-2 border-start border-danger border-4 fw-bold">
        Tin tức & Đánh giá công nghệ
      </h3>

      {loading ? (
        <div className="text-center py-5">
           <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <Row className="g-3">
          {newsList.map((news) => (
            <Col key={news._id || news.id} md={6} lg={4}>
              <Card className="border-0 shadow-sm h-100 news-card" style={{ cursor: 'pointer' }}>
                {/* Header màu gradient thay cho ảnh */}
                <div className="news-card-header" style={{
                  background: news.image ? `url(${optimizeCloudinaryUrl(news.image, 400, 200)}) center/cover` : `linear-gradient(135deg, #d70018, #ff6b35)`,
                  height: news.image ? '180px' : '8px',
                  borderRadius: '12px 12px 0 0'
                }} />

                <Card.Body className="p-3 d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Badge bg={news.tagColor} className="px-2 py-1" style={{ fontSize: '0.7rem' }}>
                      {news.tag}
                    </Badge>
                    <small className="text-muted d-flex align-items-center gap-1">
                      <FaTag size={10} /> {news.category}
                    </small>
                  </div>

                  <Card.Title className="fw-bold" style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                    {news.title}
                  </Card.Title>

                  <Card.Text className="text-muted small lh-base mb-3">
                    {news.description || news.desc}
                  </Card.Text>

                  <div className="d-flex align-items-center justify-content-between mt-auto pt-3">
                    <small className="text-muted d-flex align-items-center gap-1">
                      <FaCalendarAlt size={11} /> {news.createdAt ? new Date(news.createdAt).toLocaleDateString('vi-VN') : news.date}
                    </small>
                    <span className="text-danger small fw-semibold" style={{ cursor: 'pointer' }}>
                      Đọc thêm →
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default NewsScreen;
