const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Nhập "cối xay thịt" (bcrypt) vào để băm mật khẩu

// Bước 1: Tạo Khuôn mẫu (Schema) cho User
// Tưởng tượng đây là một quyển sổ dùng để ghi danh sách khách hàng và người quản lý.
const userSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true // Bắt buộc phải có tên
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // Mọi email đều phải là duy nhất, không ai được phép dùng lại email của người khác
    },
    password: { 
        type: String, 
        required: true // Bắt buộc phải có mật khẩu
    },
    role: { 
        type: String, 
        required: true, 
        default: 'user' // Mặc định ai mới đăng ký cũng chỉ là "user" (khách hàng bình thường)
    },
    phone: {
        type: String,
        default: '' // Số điện thoại (không bắt buộc)
    }
}, {
    timestamps: true // Tự động sinh ra 2 mốc thời gian: createdAt (Lúc mới tạo) và updatedAt (Lúc thay đổi gần nhất)
});

// Hàm kiểm tra: So sánh mật khẩu khách nhập vào vs mật khẩu đã băm trong database
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Dùng bcrypt.compare để xét xem 2 chuỗi có khớp nhau không
    return await bcrypt.compare(enteredPassword, this.password);
};

// Hàm tự động chạy TRƯỚC (pre) khi lưu (save) vào CSDL: Tự động đem mật khẩu đi băm
userSchema.pre('save', async function() {
    // Nếu mật khẩu không bị thay đổi (vd: người ta chỉ cập nhật tên), thì huỷ bỏ việc băm lại
    if (!this.isModified('password')) {
        return;
    }

    // Tạo "muối" (salt) mức độ 10 để nhào trộn mật khẩu cho phức tạp
    const salt = await bcrypt.genSalt(10);
    // Băm nát mật khẩu thật và lưu đè lên field password
    this.password = await bcrypt.hash(this.password, salt);
});

// Bước 2: Đúc thành một Mô hình (Model) thực sự tên là 'User' và xuất ra để dùng
const User = mongoose.model('User', userSchema);
module.exports = User;
