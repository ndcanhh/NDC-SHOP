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
        console.log('📤 [ROUTER] Đang phân tích ý định người dùng bằng Llama-3-8b...');
        
        // --- BƯỚC 1: INTENT ROUTING (Phân loại ý định siêu tốc với mô hình nhỏ) ---
        const routerSystemPrompt = `Bạn là bộ định tuyến (Router) phân loại ý định người dùng cho một chatbot bán điện thoại (NDC Shop). 
Hãy phân tích tin nhắn và trả về MỘT chuỗi JSON hợp lệ với định dạng: {"intent": "LOẠI_Ý_ĐỊNH", "search_query": "từ_khóa"}.
Các loại intent:
- "PRODUCT": Hỏi về giá, tồn kho, mua hàng, thông tin một loại điện thoại cụ thể. 
  Quy tắc tạo search_query: 
  + CHỈ lấy tên hãng và dòng máy (VD: "iPhone 15 Pro Max", "Samsung S24"). 
  + BỎ QUA số lượng, màu sắc, dung lượng (VD: "mua 10 chiếc ip 15 màu đen" -> "iPhone 15").
  + CHUẨN HÓA từ viết tắt (VD: "ip" -> "iPhone", "ss" -> "Samsung", "pm" -> "Pro Max").
- "ADVICE": Nhờ tư vấn, so sánh các máy, hỏi kiến thức chung. (search_query: "")
- "CHITCHAT": Chào hỏi, cảm ơn, hỏi thăm. (search_query: "")

Tuyệt đối CHỈ TRẢ VỀ CHUỖI JSON, không giải thích gì thêm.`;

        // Lấy 3 tin nhắn gần nhất để Router hiểu ngữ cảnh (ví dụ: Khách bảo "lấy tôi 2 chiếc", Router phải biết đang nói về máy nào ở câu trước)
        const recentHistory = (history || []).slice(-3).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        const routerResponse = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: routerSystemPrompt },
                ...recentHistory,
                { role: 'user', content: message }
            ],
            model: 'llama-3.1-8b-instant', // Mô hình siêu nhanh và rẻ
            temperature: 0.1, // Nhiệt độ thấp để output ổn định JSON
            response_format: { type: "json_object" } // Ép kiểu JSON
        });

        let intentData = { intent: "CHITCHAT", search_query: "" };
        try {
            intentData = JSON.parse(routerResponse.choices[0]?.message?.content);
            console.log('✅ [ROUTER] Kết quả phân tích:', intentData);
        } catch (e) {
            console.log('⚠️ [ROUTER] Lỗi parse JSON, fallback về CHITCHAT', routerResponse.choices[0]?.message?.content);
        }

        const { intent, search_query } = intentData;

        // --- BƯỚC 2: EXECUTION (Thực thi theo luồng đã phân loại) ---
        let dynamicSystemPrompt = SYSTEM_PROMPT;
        let selectedModel = 'llama-3.3-70b-versatile'; // Mặc định dùng mô hình thông minh
        let maxTokens = 1024;

        if (intent === 'PRODUCT') {
            console.log(`🔍 [RAG] Truy vấn DB với từ khóa: "${search_query}"...`);
            
            // Tìm kiếm cơ bản trong DB (có thể nâng cấp thành Vector Search sau)
            let query = null; // Mặc định không query nếu không có từ khóa
            if (search_query && search_query.trim() !== '') {
                // Tách từ khóa để tìm kiếm linh hoạt (VD: "iPhone Pro Max" -> chứa "iPhone" VÀ "Pro" VÀ "Max")
                const keywords = search_query.split(' ').filter(k => k.trim() !== '');
                if (keywords.length > 0) {
                    query = {
                        $and: keywords.map(kw => ({
                            name: { $regex: kw, $options: 'i' }
                        }))
                    };
                }
            }
            
            if (query !== null) {
                // Giới hạn số lượng sản phẩm trả về để không tràn Token
                const products = await Product.find(query).limit(10).select('name price countInStock discount specs.ram specs.rom');
                
                let productListText = "\n\n--- THÔNG TIN SẢN PHẨM TỪ DATABASE (RAG) ---\n";
                if (products.length === 0) {
                    productListText += `Hiện tại không tìm thấy sản phẩm nào khớp với yêu cầu: "${search_query}". Hãy báo cho khách biết.\n`;
                } else {
                    products.forEach((p, index) => {
                        const finalPrice = p.price - (p.price * (p.discount || 0) / 100);
                        const status = p.countInStock > 0 ? "Còn hàng" : "Hết hàng";
                        const specs = (p.specs?.ram || '') + (p.specs?.rom ? '/' + p.specs.rom : '');
                        productListText += `${index + 1}. ${p.name} ${specs ? `(${specs})` : ''} - Giá: ${finalPrice.toLocaleString('vi-VN')} VND - Trạng thái: ${status}\n`;
                    });
                }
                dynamicSystemPrompt += productListText;
            }
            
            selectedModel = 'llama-3.3-70b-versatile'; // Dùng mô hình lớn để suy luận chính xác thông tin SP

        } else if (intent === 'ADVICE') {
            console.log(`🧠 [ADVICE] Giao cho mô hình lớn tư vấn (Không gọi DB để tránh nhiễu)...`);
            dynamicSystemPrompt += "\n\n(Lưu ý: Khách đang nhờ tư vấn. Hãy đưa ra lời khuyên khách quan, sau đó có thể mời khách ghé shop. KHÔNG bịa ra giá sản phẩm nếu không chắc chắn.)";
            selectedModel = 'llama-3.3-70b-versatile'; // Tư vấn thì cần AI thông minh nhất
            
        } else { // CHITCHAT
            console.log(`💬 [CHITCHAT] Xử lý nhanh bằng mô hình nhỏ...`);
            selectedModel = 'llama-3.1-8b-instant'; // Chào hỏi chỉ cần mô hình siêu nhẹ là đủ, tiết kiệm tiền và thời gian
            maxTokens = 150;
        }

        // --- BƯỚC 3: TRẢ LỜI NGƯỜI DÙNG ---
        const chatHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        const messages = [
            { role: 'system', content: dynamicSystemPrompt },
            ...chatHistory,
            { role: 'user', content: message },
        ];

        console.log(`📤 Đang sinh câu trả lời với mô hình: ${selectedModel}...`);

        const completion = await groq.chat.completions.create({
            messages,
            model: selectedModel,
            temperature: 0.7,
            max_tokens: maxTokens,
        });

        const response = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

        console.log('✅ Sinh câu trả lời thành công!');
        res.json({ reply: response });

    } catch (error) {
        console.error('❌ Lỗi Groq AI:', error.message);
        res.status(500).json({ message: 'Lỗi khi gọi Groq AI: ' + error.message });
    }
});

module.exports = { chatWithAI };
