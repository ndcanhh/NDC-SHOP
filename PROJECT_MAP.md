# NDC SHOP - Cấu trúc Dự án và Chức năng các File

Tài liệu này liệt kê chi tiết các thành phần trong dự án NDC SHOP, giúp người đọc nắm bắt được vai trò của từng file trong hệ thống MERN Stack.

---

## 1. Thư mục Gốc (Root)
| File | Chức năng |
| :--- | :--- |
| `package.json` | Quản lý các dependencies chung và script khởi chạy toàn bộ dự án. |
| `.gitignore` | Quy định các file/thư mục không được đẩy lên GitHub (như `node_modules`, `.env`). |
| `README.md` | Tài liệu hướng dẫn cài đặt và tổng quan dự án. |

---

## 2. Phân hệ Backend (`/backend`)

### 📁 Cấu hình & Khởi tạo
| File | Chức năng |
| :--- | :--- |
| `server.js` | File chạy chính của server, kết nối DB, cấu hình Middleware và định tuyến API. |
| `config/db.js` | Thiết lập kết nối giữa ứng dụng Node.js và cơ sở dữ liệu MongoDB. |
| `.env` | Lưu trữ các biến môi trường bảo mật (API Key, MongoDB URI, JWT Secret). |

### 📁 Models (Định nghĩa dữ liệu)
| File | Chức năng |
| :--- | :--- |
| `userModel.js` | Cấu trúc dữ liệu người dùng, phân quyền và mã hóa mật khẩu. |
| `productModel.js` | Định nghĩa thông tin sản phẩm, cấu hình (specs) và các biến thể. |
| `orderModel.js` | Quản lý thông tin đơn hàng, địa chỉ giao hàng và trạng thái thanh toán. |
| `couponModel.js` | Định nghĩa mã giảm giá, hạn sử dụng và lượt dùng. |
| `addressModel.js` | Cấu trúc sổ địa chỉ của từng người dùng. |
| `newsModel.js` | Định nghĩa bài viết tin tức, danh mục và tag bài viết. |
| `contactModel.js` | Lưu trữ thông tin liên hệ từ khách hàng. |

### 📁 Controllers (Xử lý logic nghiệp vụ)
| File | Chức năng |
| :--- | :--- |
| `userController.js` | Logic Đăng ký, Đăng nhập, Profile. |
| `productController.js` | Xử lý CRUD sản phẩm, tìm kiếm và lọc. |
| `orderController.js` | Tạo đơn hàng, cập nhật trạng thái đơn hàng. |
| `paymentController.js` | Logic xử lý thanh toán VNPay (IPN & Return). |
| `newsController.js` | Quản lý các bài viết tin tức. |
| `chatbotController.js` | Kết nối Groq Cloud AI để xử lý tin nhắn của chatbot. |

### 📁 Routes (Định tuyến API)
- Chứa các file `userRoutes.js`, `productRoutes.js`, `orderRoutes.js`... để điều hướng các request từ Frontend đến đúng Controller.

---

## 3. Phân hệ Frontend (`/frontend`)

### 📁 Core & Context (Quản lý trạng thái)
| File | Chức năng |
| :--- | :--- |
| `main.jsx` | Điểm bắt đầu của ứng dụng, cấu hình Router chính. |
| `App.jsx` | Layout chính cho khách hàng (chứa Header, Footer, Chatbot). |
| `context/AuthContext.jsx` | Quản lý trạng thái đăng nhập và thông tin người dùng toàn hệ thống. |
| `context/CartContext.jsx` | Quản lý giỏ hàng (thêm/xóa/sửa) và lưu trữ vào LocalStorage. |

### 📁 Components (Thành phần giao diện tái sử dụng)
| File | Chức năng |
| :--- | :--- |
| `Header.jsx` | Thanh điều hướng cho khách hàng (Search, Cart, Menu). |
| `AdminHeader.jsx` | Thanh điều hướng riêng cho trang quản trị. |
| `Product.jsx` | Card hiển thị thông tin tóm tắt của 1 sản phẩm. |
| `Chatbot.jsx` | Widget bong bóng chat AI ở góc màn hình. |
| `AddressBook.jsx` | Thành phần quản lý sổ địa chỉ trong trang Profile. |

### 📁 Screens - Customer (Các trang dành cho khách)
| File | Chức năng |
| :--- | :--- |
| `HomeScreen.jsx` | Trang chủ hiển thị banner và danh sách sản phẩm nổi bật. |
| `ProductScreen.jsx` | Trang chi tiết sản phẩm, chọn màu sắc/dung lượng. |
| `CartScreen.jsx` | Trang giỏ hàng, cập nhật số lượng. |
| `CheckoutScreen.jsx` | Trang thanh toán, nhập địa chỉ, áp mã giảm giá. |
| `OrderScreen.jsx` | Xem lịch sử và chi tiết đơn hàng đã đặt. |
| `CompareScreen.jsx` | Trang so sánh thông số kỹ thuật giữa 2 điện thoại. |
| `NewsScreen.jsx` | Trang đọc tin tức công nghệ. |

### 📁 Screens - Admin (Các trang quản trị)
| File | Chức năng |
| :--- | :--- |
| `AdminDashboard.jsx` | Tổng quan số liệu kinh doanh qua biểu đồ. |
| `ProductListScreen.jsx` | Quản lý kho hàng và thông tin sản phẩm. |
| `OrderListScreen.jsx` | Tiếp nhận và xử lý đơn hàng từ khách. |
| `CouponListScreen.jsx` | Quản lý các chương trình khuyến mãi mã giảm giá. |
| `NewsListScreen.jsx` | Soạn thảo và quản lý bài viết tin tức. |
| `ContactListScreen.jsx` | Phản hồi các yêu cầu từ khách hàng. |
