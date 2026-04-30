# Hướng dẫn Triển khai (Deploy) Dự án NDC SHOP

Tài liệu này hướng dẫn bạn đưa dự án từ máy cá nhân (Local) lên Internet (Production) để phục vụ việc bảo vệ khóa luận.

## 1. Chuẩn bị Cơ sở dữ liệu (MongoDB Atlas)

Vì máy chủ Cloud không thể truy cập vào `localhost` của bạn, bạn cần sử dụng MongoDB Atlas (Miễn phí):
1. Truy cập [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) và tạo tài khoản.
2. Tạo một Cluster mới (chọn gói **M0 FREE**).
3. Tại mục **Database Access**, tạo User (Lưu lại mật khẩu).
4. Tại mục **Network Access**, chọn **Add IP Address** -> **Allow Access From Anywhere** (0.0.0.0/0).
5. Bấm **Connect** -> **Connect your application** -> Copy chuỗi `mongodb+srv://...`

## 2. Triển khai Backend (Render.com)

1. Đăng nhập [Render.com](https://render.com) bằng tài khoản GitHub.
2. Chọn **New** -> **Web Service**.
3. Chọn repository `NDC-SHOP`.
4. Cấu hình:
   - **Name**: `ndc-shop-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Mục **Environment Variables**, thêm các biến:
   - `PORT`: `5000`
   - `MONGO_URI`: (Chuỗi kết nối lấy ở bước 1)
   - `JWT_SECRET`: (Mật khẩu bí mật của bạn)
   - `GROQ_API_KEY`: (Key của chatbot)
   - `FRONTEND_URL`: (Link của trang khách hàng - sẽ lấy ở bước 3)

## 3. Triển khai Frontend (Vercel hoặc Render)

### Cách 1: Sử dụng Vercel (Khuyên dùng vì tốc độ nhanh)
1. Đăng nhập [Vercel.com](https://vercel.com) bằng GitHub.
2. Chọn **Add New** -> **Project** -> Import `NDC-SHOP`.
3. Cấu hình:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Bấm **Deploy**. Sau khi xong, bạn sẽ có một link dạng `ndc-shop.vercel.app`.

### Lưu ý quan trọng về API URL:
Trong code frontend (thường là file `vite.config.js` hoặc các file gọi axios), bạn cần đảm bảo gọi đến URL của Backend trên Render thay vì `localhost:5000`.

## 4. Cấu hình Thanh toán VNPay

Để VNPay hoạt động sau khi deploy:
1. Bạn cần cập nhật `vnp_ReturnUrl` trong mã nguồn Backend thành: `https://<your-frontend-domain>/orders` (Trang kết quả đơn hàng).
2. Đảm bảo server Backend có thể nhận được IPN từ VNPay (Render gói Free có thể bị ngủ, nên cần dùng dịch vụ như Cron-job.org để "đánh thức" server).

## 5. Kiểm tra sau khi Deploy
- Thử đăng ký tài khoản mới.
- Thử đặt hàng và thanh toán.
- Thử chat với AI để xem kết nối API có thông suốt không.

> [!IMPORTANT]
> Luôn giữ bí mật các file `.env`. Tuyệt đối không sửa file `.env` trực tiếp trên GitHub mà hãy nhập các biến này vào mục **Environment** của Render/Vercel.
