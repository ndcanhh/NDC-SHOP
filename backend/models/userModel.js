const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true
    },
    password: { 
        type: String, 
        required: true
    },
    role: { 
        type: String, 
        required: true, 
        default: 'user'
    },
    phone: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// So sánh mật khẩu khách nhập vào vs mật khẩu đã băm trong database
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Dùng bcrypt.compare để xét xem 2 chuỗi có khớp nhau không
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function() {
    // Nếu mật khẩu k bị thay đổi thì huỷ bỏ việc băm lại
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
