const Groq = require('groq-sdk');
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel'); // Thêm model Product

// Khởi tạo Groq client với API key từ .env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System prompt — "nhập vai" cho AI thành nhân viên NDC Shop
const SYSTEM_PROMPT = `Bạn là trợ lý ảo của NDC Shop — cửa hàng bán điện thoại chính hãng tại Hà Nội.

Thông tin cửa hàng:
- Địa chỉ: 70 ngõ 176 Trương Định, Hai Bà Trưng, Hà Nội
- Hotline: 0973 521 509
- Email: ndcshop@gmail.com
- Giờ mở cửa: 8:00 – 22:00 (cả T7, CN & lễ)

Chính sách:
- Thanh toán: COD, chuyển khoản, MoMo, ZaloPay
- Giao hàng: Nội thành HN 1-2 ngày, tỉnh khác 3-5 ngày. Miễn phí ship đơn trên 5 triệu.
- Bảo hành: 12 tháng chính hãng, 1 đổi 1 trong 30 ngày nếu lỗi NSX
- Đổi trả: 7 ngày, sản phẩm còn seal. Hoàn tiền 3-5 ngày làm việc.
- Trả góp: 0% lãi suất, chỉ cần CCCD + thẻ tín dụng.

Quy tắc trả lời BẮT BUỘC:
1. Trả lời ngắn gọn, thân thiện, dùng emoji phù hợp. Luôn trả lời bằng tiếng Việt.
2. Nếu không biết hoặc vấn đề ngoài phạm vi cửa hàng, hãy hướng dẫn gọi Hotline 0973 521 509.
3. KHÔNG BAO GIỜ bịa ra thông tin sản phẩm.
4. TUYỆT ĐỐI CHỈ TƯ VẤN các sản phẩm có trong danh sách được cung cấp bên dưới. Nếu khách hỏi máy không có trong danh sách, phải trả lời rõ là "Hiện tại shop không kinh doanh dòng máy này" và gợi ý các máy tương đương trong danh sách.
5. Luôn báo giá sau khi đã trừ đi phần trăm giảm giá (nếu có).`;

// @desc    Chat với AI (Groq - Llama)
// @route   POST /api/chatbot
// @access  Public
const chatWithAI = asyncHandler(async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Vui lòng nhập tin nhắn!');
    }

    if (!process.env.GROQ_API_KEY) {
        console.error('❌ Chưa có GROQ_API_KEY trong .env!');
        res.status(500);
        throw new Error('Chưa cấu hình GROQ_API_KEY!');
    }

    try {
        // --- 1. LẤY DANH SÁCH SẢN PHẨM TỪ DATABASE ---
        const products = await Product.find({}).select('name price countInStock discount specs.ram specs.rom');
        
        let productListText = "\n\n--- DANH SÁCH SẢN PHẨM HIỆN CÓ TẠI CỬA HÀNG ---\n";
        if (products.length === 0) {
            productListText += "Hiện tại web đang trống, chưa có sản phẩm nào.\n";
        } else {
            products.forEach((p, index) => {
                const finalPrice = p.price - (p.price * (p.discount || 0) / 100);
                const status = p.countInStock > 0 ? "Còn hàng" : "Hết hàng";
                const specs = (p.specs?.ram || '') + (p.specs?.rom ? '/' + p.specs.rom : '');
                productListText += `${index + 1}. ${p.name} ${specs ? `(${specs})` : ''} - Giá: ${finalPrice.toLocaleString('vi-VN')} VND (Giảm ${p.discount}%) - Tình trạng: ${status}\n`;
            });
        }

        // Ghép System Prompt với danh sách sản phẩm thực tế
        const dynamicSystemPrompt = SYSTEM_PROMPT + productListText;

        // --- 2. CHUẨN BỊ TIN NHẮN CHO AI ---
        // Chuyển đổi lịch sử chat sang định dạng Groq/OpenAI
        const chatHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        // Tạo danh sách messages: system prompt (dynamic) + lịch sử + tin nhắn mới
        const messages = [
            { role: 'system', content: dynamicSystemPrompt },
            ...chatHistory,
            { role: 'user', content: message },
        ];

        console.log('📤 Đang gửi request đến Groq AI...');

        // Gọi Groq API với model llama-3.3-70b-versatile
        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
        });

        const response = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

        console.log('✅ Groq AI trả lời thành công!');
        res.json({ reply: response });
    } catch (error) {
        console.error('❌ Lỗi Groq AI:', error.message);
        console.error('❌ Chi tiết:', error);
        res.status(500).json({ message: 'Lỗi khi gọi Groq AI: ' + error.message });
    }
});

module.exports = { chatWithAI };
