// Khi bạn gửi dữ liệu dạng formData và muốn validate các trường dữ liệu trong đó bằng express-validator,
// bạn cần lưu ý rằng các trường dữ liệu được gửi dưới dạng JSON trong formData không thể được đọc trực tiếp
// như cách bạn sử dụng body("name").Điều này là do dữ liệu được gửi dưới dạng chuỗi JSON trong trường productInfor.

// Để giải quyết vấn đề này:
// Phân tích chuỗi JSON trong middleware trước khi validate
// Bạn cần parse (phân tích) chuỗi JSON trong productInfor để trích xuất dữ liệu thành các trường riêng lẻ
// trước khi thực hiện validate.

exports.parseToJSON = (req, res, next) => {
  if (req.body && req.body.productInfor) {
    try {
      req.body = {
        ...req.body,
        ...JSON.parse(req.body.productInfor),
      };
      delete req.body.productInfor; // Xoá bỏ trường gốc ban đầu "productInfor" trong thuộc tính "req.body"
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Invalid JSON format in productInfor" });
    }
  }
  next();
};
