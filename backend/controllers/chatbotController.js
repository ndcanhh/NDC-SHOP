const Groq = require('groq-sdk');
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const ChatHistory = require('../models/chatHistoryModel');


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System prompt
const SYSTEM_PROMPT = `Bạn là trợ lý ảo AI chính thức và chuyên nghiệp của cửa hàng điện thoại di động "NDC Shop". Nhiệm vụ của bạn là tư vấn, hỗ trợ khách hàng mua sắm và giải đáp các thắc mắc liên quan đến cửa hàng một cách lịch sự, chính xác và thân thiện. Bạn luôn xưng hô là "em" và gọi khách hàng là "Anh/Chị".

QUY TẮC CỐT LÕI (NGHIÊM CẤM VI PHẠM):

1. Phạm vi trả lời: Bạn CHỈ ĐƯỢC PHÉP trả lời các câu hỏi thuộc các chủ đề sau:
- Thông tin về NDC Shop (địa chỉ: 70 ngõ 176 Trương Định, Hai Bà Trưng, Hà Nội, hotline: 0973 521 509, email: ndcshop@gmail.com, giờ mở cửa: 8:00 – 22:00, chính sách bảo hành, đổi trả, khuyến mãi...).
- Các sản phẩm điện thoại đang có mặt tại cửa hàng.
- Thông số kỹ thuật chi tiết của các dòng máy.
- Kiến thức về công nghệ điện thoại di động (ví dụ: so sánh chip, công nghệ màn hình, camera...).
2. Tuyệt đối KHÔNG trả lời về ĐƠN HÀNG: 
- Nếu khách hỏi về trạng thái đơn hàng, hủy đơn, hoặc kiểm tra mã đơn hàng, hãy trả lời lịch sự: "Dạ em xin lỗi, em chưa có quyền truy cập vào hệ thống quản lý đơn hàng. Anh/Chị vui lòng liên hệ Hotline 0973 521 509 hoặc nhắn tin trực tiếp cho Fanpage để được nhân viên hỗ trợ kiểm tra chính xác nhất nhé!"
- TUYỆT ĐỐI KHÔNG tự bịa ra thông tin đơn hàng hay trạng thái đơn hàng.

3. Tư vấn SẢN PHẨM & TỒN KHO:
- Khi khách hỏi về một sản phẩm, bạn phải liệt kê ĐẦY ĐỦ các phiên bản (màu sắc, bộ nhớ) và tình trạng CÒN HÀNG/HẾT HÀNG dựa trên danh sách dữ liệu thực tế được cung cấp bên dưới.
- TUYỆT ĐỐI KHÔNG được tiết lộ số lượng cụ thể (ví dụ: không được nói "còn 5 máy"). Chỉ được nói là "Còn hàng" hoặc "Hết hàng".
- Nếu khách hỏi chung chung, hãy liệt kê các bản phổ biến nhất.
- BẮT BUỘC dùng định dạng link Markdown [Tên sản phẩm - Phiên bản](/product/ID) để khách bấm vào.

Từ chối câu hỏi ngoài lề: Tuyệt đối KHÔNG trả lời bất kỳ câu hỏi nào nằm ngoài phạm vi trên (y tế, tình cảm, lập trình, kiến thức chung không liên quan đến điện thoại, v.v.). Khi từ chối, phải trả lời lịch sự và hướng khách hàng quay lại chủ đề sản phẩm/dịch vụ của NDC Shop.

Xử lý yêu cầu tư vấn theo mức giá: Khi khách hàng đưa ra yêu cầu như "Tôi muốn mua máy khoảng [X] triệu" hoặc tương tự, bạn phải đề xuất các sản phẩm có mức giá dao động gần với [X] nhất (có thể cao hơn hoặc thấp hơn một chút, biên độ dao động không quá 15-20%). KHÔNG đề xuất các máy có giá quá xa so với mức ngân sách khách hàng đưa ra.

VÍ DỤ VỀ CÁCH XỬ LÝ TÌNH HUỐNG (FEW-SHOT EXAMPLES):
Khách hàng: chào
Trợ lý ảo: Dạ em chào Anh/Chị, em là trợ lý ảo của NDC Shop. Em có thể hỗ trợ thông tin sản phẩm hay chính sách nào cho Anh/Chị ạ?

Khách hàng: đau đầu nên uống thuốc gì
Trợ lý ảo: Dạ em rất tiếc, nhưng em không thể tư vấn về thuốc hay vấn đề y tế. Anh/Chị vui lòng tham khảo bác sĩ hoặc đến cơ sở y tế gần nhất để được khám và điều trị chính xác nhé.

Khách hàng: người yêu dỗi thì nên làm gì
Trợ lý ảo: Dạ em rất tiếc, nhưng em không thể tư vấn về các vấn đề cá nhân như vậy. Nếu Anh/Chị cần hỗ trợ về sản phẩm, dịch vụ hoặc chính sách của NDC Shop, em sẵn sàng giúp đỡ ạ.

Khách hàng: viết đoạn code html
Trợ lý ảo: Xin lỗi Anh/Chị, em chỉ có thể hỗ trợ thông tin về sản phẩm, dịch vụ và chính sách của NDC Shop. Nếu có nhu cầu liên quan, vui lòng cho em biết nhé!

Khách hàng: erd là gì
Trợ lý ảo: Dạ em rất tiếc, nhưng em chỉ có thể hỗ trợ thông tin về sản phẩm, dịch vụ và chính sách của NDC Shop. Nếu Anh/Chị cần tư vấn về các nội dung này, em sẵn sàng giúp đỡ ạ.

KHI NHẮC ĐẾN TÊN SẢN PHẨM trong câu trả lời, BẮT BUỘC PHẢI DÙNG định dạng link Markdown [Tên sản phẩm](/product/ID) giống y hệt như được cung cấp trong danh sách để khách hàng có thể bấm vào.

VÍ DỤ TỪ CHỐI ĐƠN HÀNG:
Khách hàng: kiểm tra đơn hàng #12345
Trợ lý ảo: Dạ em xin lỗi, em chưa có quyền truy cập vào hệ thống quản lý đơn hàng. Anh/Chị vui lòng liên hệ Hotline 0973 521 509 hoặc nhắn tin trực tiếp cho Fanpage để được nhân viên hỗ trợ kiểm tra chính xác nhất nhé!

Khách hàng: đơn hàng của tôi bao giờ giao?
Trợ lý ảo: Dạ em xin lỗi Anh/Chị, hiện tại em không thể kiểm tra thông tin vận chuyển hay trạng thái đơn hàng cụ thể. Anh/Chị vui lòng gọi Hotline 0973 521 509 để nhân viên check thông tin và báo ngay cho mình nhé!`;

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
        console.error('Chưa có GROQ_API_KEY trong .env!');
        res.status(500);
        throw new Error('Chưa cấu hình GROQ_API_KEY!');
    }


        try {
        console.log('Đang phân tích ý định người dùng...');

        //INTENT ROUTING
        const routerSystemPrompt = `Bạn là bộ định tuyến phân loại ý định cho chatbot bán điện thoại NDC Shop.
Trả về JSON: {"intent": "...", "search_query": "..."}.

PHÂN LOẠI:
- "PRODUCT": Hỏi giá/tồn kho của MỘT MÁY CỤ THỂ có tên hãng rõ ràng.
  VD: "ip 15 bao nhiêu", "samsung s24 còn hàng không", "giá oppo reno"
  search_query: CHỈ tên hãng + dòng máy (VD: "iPhone 15", "Samsung S24 Ultra").
  CHUẨN HÓA: ip→iPhone, ss→Samsung, pm→Pro Max.

- "ADVICE": Tư vấn THEO NHU CẦU, so sánh, hoặc THEO NGÂN SÁCH/TẦM GIÁ.
  VD: "máy tầm 10 triệu", "điện thoại chơi game 8 triệu", "máy pin trâu", "so sánh iphone samsung"
  search_query: "" (luôn rỗng)

- "CHITCHAT": Chào hỏi, cảm ơn, xã giao. search_query: ""

- "OFF_TOPIC": Không liên quan điện thoại/cửa hàng. search_query: ""

QUY TẮC VÀNG: Câu hỏi có "triệu", "ngân sách", "tầm giá", "dưới X triệu" → LUÔN LÀ "ADVICE".
CHỈ trả về JSON, không giải thích.`;

        // Chỉ lấy 2 tin nhắn gần nhất để router phân tích
        const recentHistory = (history || []).slice(-4).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        const routerResponse = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: routerSystemPrompt },
                ...recentHistory,
                { role: 'user', content: message }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1, 
            response_format: { type: "json_object" } 
        });

        let intentData = { intent: "CHITCHAT", search_query: "" };
        try {
            intentData = JSON.parse(routerResponse.choices[0]?.message?.content);
        } catch (e) {
            console.log('[ROUTER] Lỗi parse JSON, fallback về CHITCHAT', routerResponse.choices[0]?.message?.content);
        }

        const { intent, search_query } = intentData;

        console.log(`LOẠI CÂU HỎI (INTENT): [${intent}]`);
        if (search_query) console.log(`TỪ KHÓA: "${search_query}"`);

        // BƯỚC 2: EXECUTION
        let dynamicSystemPrompt = SYSTEM_PROMPT;
        let selectedModel = 'llama-3.3-70b-versatile';
        let maxTokens = 512;
        let historyLimit = 5; // Số tin nhắn lịch sử tối đa gửi lên

        if (intent === 'PRODUCT') {
            console.log(`[RAG] Truy vấn DB với từ khóa: "${search_query}"...`);

            let products = [];
            if (search_query && search_query.trim() !== '') {
                const keywords = search_query.split(' ').filter(k => k.trim() !== '');
                if (keywords.length > 0) {
                    products = await Product.find({
                        $and: keywords.map(kw => ({
                            name: { $regex: kw, $options: 'i' }
                        }))
                    }).limit(10).select('name price variants discount specs.ram specs.rom');
                }
            }

            if (products.length > 0) {
                // Tìm thấy máy cụ thể → hiển thị thông tin chi tiết từng phiên bản
                let productListText = "\n\n--- THÔNG TIN CHI TIẾT SẢN PHẨM (Hãy liệt kê đủ bản cho khách) ---\n";
                products.forEach((p) => {
                    productListText += `Sản phẩm: [${p.name}](/product/${p._id})\nCác phiên bản:\n`;
                    if (p.variants && p.variants.length > 0) {
                        p.variants.forEach(v => {
                            const status = v.countInStock > 0 ? "Còn hàng" : "Hết hàng";
                            productListText += `- Bản ${v.ram}/${v.rom}, màu ${v.color}: Giá ${v.price.toLocaleString('vi-VN')} VND — ${status}\n`;
                        });
                    } else {
                        const status = p.countInStock > 0 ? "Còn hàng" : "Hết hàng";
                        productListText += `- Giá mặc định: ${p.price.toLocaleString('vi-VN')} VND — ${status}\n`;
                    }
                    productListText += "\n";
                });
                dynamicSystemPrompt += productListText;
            } else {
                // Không tìm thấy máy cụ thể → fallback: hiển toàn bộ danh sách để tư vấn
                console.log(`[RAG] Không tìm thấy "${search_query}" → fallback sang tư vấn toàn bộ danh sách`);
                const allProducts = await Product.find().sort({ price: 1 }).limit(20).select('name price variants countInStock');
                let fallbackText = `\n\n--- NDC Shop hiện không có máy tên "${search_query}". Dưới đây là các máy khác (hãy gợi ý máy tương đương) ---\n`;
                allProducts.forEach((p, i) => {
                    const stock = p.variants?.reduce((s, v) => s + (v.countInStock || 0), 0) || p.countInStock || 0;
                    if (stock > 0) {
                        fallbackText += `${i + 1}. [${p.name}](/product/${p._id}) — Giá từ ${p.price.toLocaleString('vi-VN')} VND\n`;
                    }
                });
                dynamicSystemPrompt += fallbackText;
            }

            selectedModel = 'llama-3.3-70b-versatile';
            historyLimit = 6;

        } else if (intent === 'ADVICE') {
            console.log(`[ADVICE] Tải sản phẩm từ DB để tư vấn...`);

            // Tìm xem người dùng có nhắc đến giá tiền không (VD: 20 triệu, 15tr, 5 củ)
            let budget = null;
            const budgetMatch = message.match(/(\d+)\s*(triệu|tr|củ)/i);
            if (budgetMatch) {
                budget = parseInt(budgetMatch[1]) * 1000000;
            }

            let query = {};
            if (budget) {
                // query các máy trong khoảng budget ± 30%
                const minPrice = budget * 0.7;
                const maxPrice = budget * 1.3;
                query = { price: { $gte: minPrice, $lte: maxPrice } };
                console.log(`[ADVICE] Lọc theo ngân sách: ~${budget.toLocaleString('vi-VN')} VND`);
            }

            // Lấy tất cả sản phẩm còn hàng
            const allProducts = await Product.find(query)
                .sort({ price: 1 })
                .limit(10)
                .select('name price discount specs.ram specs.rom variants category countInStock');

            let productListText = "\n\n--- DANH SÁCH SẢN PHẨM GỢI Ý (kèm chi tiết phiên bản) ---\n";
            allProducts.forEach((p, i) => {
                const totalStock = p.variants ? p.variants.reduce((sum, v) => sum + (v.countInStock || 0), 0) : (p.countInStock || 0);
                if (totalStock > 0) {
                    productListText += `${i + 1}. [${p.name}](/product/${p._id})\n`;
                    if (p.variants && p.variants.length > 0) {
                        p.variants.forEach(v => {
                            if (v.countInStock > 0) {
                                productListText += `   - Bản ${v.ram}/${v.rom}, màu ${v.color}: ${v.price.toLocaleString('vi-VN')} VND\n`;
                            }
                        });
                    } else {
                        productListText += `   - Giá: ${p.price.toLocaleString('vi-VN')} VND\n`;
                    }
                }
            });
            productListText += "---\nLƯU Ý: Tuyệt đối không tự bịa thông tin đơn hàng. Khi khách hỏi về máy, hãy liệt kê các phiên bản màu sắc và bộ nhớ dựa trên dữ liệu trên để khách dễ chọn.";

            dynamicSystemPrompt += productListText;
            selectedModel = 'llama-3.3-70b-versatile';
            historyLimit = 6;

        } else if (intent === 'OFF_TOPIC') {
            console.log(`[OFF_TOPIC] Từ chối ngoài phạm vi — trả về câu cứng...`);
            // Trả về câu từ chối cứng, KHÔNG gọi AI để tránh mọi rủi ro trả lời sai phạm vi
            return res.json({
                reply: 'Dạ em xin lỗi Anh/Chị, em là trợ lý ảo chuyên về điện thoại của NDC Shop 📱\nEm không thể hỗ trợ các vấn đề ngoài lĩnh vực này.\nAnh/Chị có cần tư vấn về điện thoại hoặc dịch vụ của shop không ạ?'
            });

        } else { // CHITCHAT
            console.log(`[CHITCHAT] Xử lý nhanh...`);
            // Dùng prompt rút gọn để tiết kiệm token
            dynamicSystemPrompt = `Bạn là trợ lý ảo NDC Shop. Hãy xưng "em" và gọi khách là "Anh/Chị". Trả lời xã giao thật ngắn gọn, lễ phép, thân thiện và có emoji.`;
            selectedModel = 'llama-3.1-8b-instant';
            maxTokens = 120;
            historyLimit = 4;
        }

        // BƯỚC 3: TRẢ LỜI NGƯỜI DÙNG
        // Giới hạn lịch sử theo từng loại intent để tránh vượt token
        const chatHistory = (history || []).slice(-historyLimit).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        const messages = [
            { role: 'system', content: dynamicSystemPrompt },
            ...chatHistory,
            { role: 'user', content: message },
        ];

        console.log(`Đang sinh câu trả lời với mô hình: ${selectedModel}...`);

        const completion = await groq.chat.completions.create({
            messages,
            model: selectedModel,
            temperature: 0.7,
            max_tokens: maxTokens,
        });

        const response = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

        console.log('Sinh câu trả lời thành công!');
        res.json({ reply: response });

    } catch (error) {
        console.error('Lỗi Groq AI:', error.message);
        res.status(500).json({ message: 'Lỗi khi gọi Groq AI: ' + error.message });
    }
});


// @desc    Lấy lịch sử chat của user đang đăng nhập
// @route   GET /api/chatbot/history
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const chat = await ChatHistory.findOne({ user: userId });
    if (chat) {
        res.json(chat.messages);
    } else {
        res.json([]);
    }
});

// @desc    Lưu lịch sử chat của user đang đăng nhập
// @route   POST /api/chatbot/save
// @access  Private
const saveHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { messages } = req.body;

    await ChatHistory.findOneAndUpdate(
        { user: userId },
        { user: userId, messages, sessionId: userId.toString() },
        { upsert: true, new: true }
    );

    res.json({ success: true });
});

module.exports = { chatWithAI, getHistory, saveHistory };
