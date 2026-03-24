// Cấu hình API base URL — tập trung 1 nơi để dễ thay đổi khi deploy
// Trong quá trình phát triển (dev), Vite proxy đã tự chuyển /api → localhost:5000
// Khi deploy production, đặt biến VITE_API_URL trong file .env của frontend
// VD: VITE_API_URL=https://api.ndcshop.com

const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
