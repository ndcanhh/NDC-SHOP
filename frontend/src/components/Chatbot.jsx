import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/authContextValue';
import { Link, useLocation } from 'react-router-dom';

// Gợi ý nhanh cho người dùng khi mở chatbot
const quickReplies = ['Thanh toán', 'Giao hàng', 'Bảo hành', 'Đổi trả', 'Trả góp', 'Địa chỉ cửa hàng'];

const INITIAL_MESSAGE = { sender: 'bot', text: 'Xin chào! 👋 Tôi là trợ lý AI của NDC Shop.\nBạn có thể hỏi tôi bất cứ điều gì về sản phẩm, thanh toán, giao hàng, bảo hành...' };

const Chatbot = () => {
  const { userInfo } = useContext(AuthContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMessage = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <Link 
            key={index} 
            to={match[2]} 
            style={{ color: '#0d6efd', fontWeight: 'bold', textDecoration: 'none' }}
            onClick={() => setIsOpen(false)} // Đóng chatbot khi bấm vào link
          >
            {match[1]}
          </Link>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Đóng chatbot khi chuyển trang hoặc đăng xuất (cách chuẩn React mới không dùng useEffect)
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [prevUser, setPrevUser] = useState(userInfo);

  if (location.pathname !== prevPath || userInfo !== prevUser) {
    setPrevPath(location.pathname);
    setPrevUser(userInfo);
    setIsOpen(false);
  }

  // Load lịch sử chat khi userInfo thay đổi (đăng nhập / đổi tài khoản / đăng xuất)
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (userInfo?.token) {
        // Đã đăng nhập → tải lịch sử từ DB
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get('/api/chatbot/history', config);
          if (isMounted) {
            if (data && data.length > 0) {
              // DB lưu dạng { sender, content } → chuyển sang { sender, text }
              const converted = data.map(m => ({ sender: m.sender, text: m.content }));
              setMessages([INITIAL_MESSAGE, ...converted]);
            } else {
              setMessages([INITIAL_MESSAGE]);
            }
          }
        } catch (err) {
          if (isMounted) {
            console.error('Không tải được lịch sử chat:', err);
            setMessages([INITIAL_MESSAGE]);
          }
        }
      } else {
        // Chưa đăng nhập → dùng localStorage
        try {
          const saved = localStorage.getItem('chatHistory_guest');
          if (isMounted) setMessages(saved ? JSON.parse(saved) : [INITIAL_MESSAGE]);
        } catch {
          if (isMounted) setMessages([INITIAL_MESSAGE]);
        }
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [userInfo]);

  // Lưu lịch sử sau khi nhận được reply
  const persistHistory = useCallback(async (updatedMessages) => {
    if (userInfo?.token) {
      // Đăng nhập → lưu lên DB (bỏ tin nhắn chào đầu tiên)
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const toSave = updatedMessages
          .filter((_, i) => i > 0) // bỏ tin chào mặc định
          .map(m => ({ sender: m.sender, content: m.text }));
        await axios.post('/api/chatbot/save', { messages: toSave }, config);
      } catch (err) {
        console.error('Không lưu được lịch sử chat:', err);
      }
    } else {
      // Chưa đăng nhập → lưu localStorage
      localStorage.setItem('chatHistory_guest', JSON.stringify(updatedMessages));
    }
  }, [userInfo]);

  const handleSend = async (e, quickText) => {
    if (e) e.preventDefault();
    const text = quickText || input.trim();
    if (!text || loading) return;

    const updatedMessages = [...messages, { sender: 'user', text }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/chatbot', {
        message: text,
        history: updatedMessages.slice(1),
      });

      const finalMessages = [...updatedMessages, { sender: 'bot', text: data.reply }];
      setMessages(finalMessages);
      await persistHistory(finalMessages);
    } catch {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại hoặc gọi Hotline 0973 521 509!'
      }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Nút bong bóng chat */}
      {!isOpen && (
        <Button 
          variant="danger" 
          className="rounded-circle shadow-lg"
          style={{ 
            position: 'fixed', bottom: '30px', right: '30px', 
            width: '60px', height: '60px', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
          onClick={() => setIsOpen(true)}
        >
          <FaComments size={30} />
        </Button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <Card 
          className="shadow-lg border-0" 
          style={{ 
            position: 'fixed', bottom: '20px', right: '20px', 
            width: '370px', height: '520px', zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            borderRadius: '15px', overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Card.Header className="bg-brand-red text-white d-flex justify-content-between align-items-center p-3 border-0">
            <div className="d-flex align-items-center gap-2 fw-bold">
              <FaRobot size={24} /> NDC Trợ lý AI
              {/* <span className="badge bg-success" style={{ fontSize: '0.6rem' }}>Groq</span> */}
            </div>
            <Button variant="link" className="text-white p-0" onClick={() => setIsOpen(false)}>
              <FaTimes size={20} />
            </Button>
          </Card.Header>

          {/* Khu vực tin nhắn */}
          <Card.Body className="bg-light p-3" style={{ overflowY: 'auto', flex: 1 }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="bg-white rounded-circle d-flex justify-content-center align-items-center shadow-sm me-2" style={{ width: '35px', height: '35px', flexShrink: 0 }}>
                    <FaRobot className="text-danger" />
                  </div>
                )}
                
                <div 
                  className={`p-2 px-3 rounded-3 shadow-sm ${msg.sender === 'user' ? 'bg-danger text-white' : 'bg-white text-dark'}`}
                  style={{ maxWidth: '75%', fontSize: '0.9rem', whiteSpace: 'pre-line' }}
                >
                  {renderMessage(msg.text)}
                </div>

                {msg.sender === 'user' && (
                  <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center text-white ms-2" style={{ width: '35px', height: '35px', flexShrink: 0 }}>
                    <FaUser size={15} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="d-flex mb-3 justify-content-start">
                <div className="bg-white rounded-circle d-flex justify-content-center align-items-center shadow-sm me-2" style={{ width: '35px', height: '35px', flexShrink: 0 }}>
                  <FaRobot className="text-danger" />
                </div>
                <div className="bg-white p-2 px-3 rounded-3 shadow-sm text-muted" style={{ fontSize: '0.9rem' }}>
                  <Spinner animation="grow" size="sm" className="me-1" />
                  <Spinner animation="grow" size="sm" className="me-1" style={{ animationDelay: '0.15s' }} />
                  <Spinner animation="grow" size="sm" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </Card.Body>

          {/* Gợi ý nhanh */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 pb-2 d-flex flex-wrap gap-1">
              {quickReplies.map((text) => (
                <Button
                  key={text}
                  variant="outline-danger"
                  size="sm"
                  style={{ borderRadius: '20px', fontSize: '0.75rem' }}
                  onClick={() => handleSend(null, text)}
                >
                  {text}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <Card.Footer className="bg-white p-2 border-0 shadow-sm">
            <Form onSubmit={handleSend} className="d-flex gap-2">
              <Form.Control 
                type="text" 
                placeholder="Nhập tin nhắn..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                style={{ borderRadius: '20px', backgroundColor: '#f4f6f8', border: 'none' }}
              />
              <Button type="submit" variant="danger" className="rounded-circle d-flex justify-content-center align-items-center" disabled={loading} style={{ width: '40px', height: '40px' }}>
                <FaPaperPlane size={16} />
              </Button>
            </Form>
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default Chatbot;

