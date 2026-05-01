/**
 * Hàm "phép thuật" Cloudinary: chèn tham số resize + nén vào giữa URL
 * VD: .../upload/v123/abc.png → .../upload/c_fill,w_400,h_400,q_auto,f_auto/v123/abc.png
 * c_fill = cắt vừa khung | w_400,h_400 = 400x400px | q_auto = tự nén | f_auto = tự chọn định dạng nhẹ nhất (webp)
 */
export const optimizeCloudinaryUrl = (url, width = 400, height = 400) => {
    if (!url || !url.includes('cloudinary')) return url; // Nếu không phải URL Cloudinary thì bỏ qua
    // Đảm bảo không chèn tham số nhiều lần nếu URL đã được tối ưu
    if (url.includes('c_fill,w_')) return url;
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
};
