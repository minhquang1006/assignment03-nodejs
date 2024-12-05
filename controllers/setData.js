const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const nodeMailer = require("nodemailer");
const { validationResult } = require("express-validator");

// Config to send email in nodejs
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: "phihungkaraoke84@gmail.com",
    pass: "ypox gyzj cpap fbhy",
  },
});

// Action for add new cart for current user
exports.addCart = async (req, res, next) => {
  // Get data of new cart from "body" property of request
  const userID = req.body.userID;
  const productID = req.body.productID;
  const quantity = req.body.quantity;

  // Define a new cart item
  const newCartItem = {
    userID: userID,
    cartData: [{ productId: productID, quantity: quantity }],
  };

  // Tìm và cập nhật
  const updatedCart = await Cart.findOneAndUpdate(
    { userID: userID, "cartData.productId": productID },
    {
      // Nếu đã tồn tại productId, cập nhật quantity
      $inc: { "cartData.$.quantity": quantity },
    },
    { new: true } // Trả về document đã cập nhật
  );

  // Nếu không tìm thấy productId trong mảng, thêm mới
  if (!updatedCart) {
    await Cart.findOneAndUpdate(
      { userID: userID },
      {
        $push: {
          cartData: { productId: productID, quantity: quantity },
        },
      },
      { new: true, upsert: true } // upsert để tạo mới document nếu không tồn tại
    );
  }

  console.log("Cập nhật giỏ hàng thành công!");

  return res
    .status(201)
    .json({ message: "Add to cart process is successful!" });
};

// Action for update cart for current user
exports.updateCart = async (req, res, next) => {
  // Get data of new cart from "body" property of request
  const userID = req.body.userID;
  const productID = req.body.productID;
  const quantity = req.body.quantity;

  // Tìm và cập nhật
  await Cart.findOneAndUpdate(
    { userID: userID, "cartData.productId": productID },
    {
      // Nếu đã tồn tại productId, cập nhật quantity
      $set: { "cartData.$.quantity": quantity },
    },
    { new: true } // Trả về document đã cập nhật
  );

  console.log("Cập nhật giỏ hàng thành công!");

  return res
    .status(201)
    .json({ message: "Add to cart process is successful!" });
};

// Action for update quantity of products after completed order
exports.updateQuantityOfProducts = async (req, res, next) => {
  // Get data of new cart from "body" property of request
  const productArr = req.body.productsInOrder;

  // Tìm và cập nhật
  productArr.map(async (prod) => {
    await Product.findByIdAndUpdate(prod.productId, {
      $inc: { count: -prod.quantity },
    });
  });

  console.log("Cập nhật giỏ hàng thành công!");

  return res
    .status(201)
    .json({ message: "Update quantity of products is successful!" });
};

// Action for delete an item in cart for current user
exports.deleteItemInCart = async (req, res, next) => {
  // Get data of new cart from "body" property of request
  const userID = req.body.userID;
  const productID = req.body.productID;

  // Tìm và cập nhật
  await Cart.updateOne(
    { userID: userID }, // Điều kiện để tìm document
    {
      $pull: {
        cartData: { productId: productID }, // Điều kiện để xóa phần tử trong mảng
      },
    }
  );

  console.log("Xoá phần tử trong giỏ hàng của người dùng hiện tại thành công!");

  return res
    .status(201)
    .json({ message: "Delete an item in cart process is successful!" });
};

// Action for create a new order
exports.createOrder = async (req, res, next) => {
  // Get order data from "body" property of request
  const orderInfor = req.body.orderData.orderInfor;
  const emailContent = req.body.orderData.emailContent;

  const order = new Order(orderInfor);
  order.save();

  // Send email to user to confirm successful order
  transporter.sendMail(
    {
      from: "phihungkaraoke84@gmail.com",
      to: orderInfor.user.email, // "email" ở đây có thể thay bằng một địa chỉ email thực (VD: daotao@funix.edu.vn) để việc gửi mail được thành công
      subject: "Email confirm your order is succesfull",
      html: emailContent,
    },
    function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    }
  );

  return res
    .status(201)
    .json({ message: "Create order process is successful!" });
};

// Action for delete cart
exports.deleteCart = (req, res, next) => {
  // Get "userID" from "body" property of request
  const userID = req.body.userID;

  Cart.findOneAndDelete({ userID: userID })
    .then((result) => {
      return res
        .status(201)
        .json({ message: "Delete cart process is successful!" });
    })
    .catch((err) => console.log("Error in delete cart: ", err));
};

// Action for add new product
exports.postAddNewProduct = (req, res, next) => {
  const imageArr = req.files;
  // const productInfor = req.body.productInfor;
  const name = req.body.name;
  const category = req.body.category;
  const price = req.body.price;
  const short_desc = req.body.short_desc;
  const long_desc = req.body.long_desc;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: errors.array()[0].msg,
      isErrorValidate: true,
    });
  }

  // Check if the file upload was successful
  if (!imageArr) {
    return res.status(422).json({
      message: "Upload file is not success!",
      isErrorValidate: true,
    });
  }

  const imageObj = {};
  imageArr.forEach((img, index) => {
    imageObj[`img${index + 1}`] = img.path;
  });

  const productData = {
    name,
    category,
    price,
    short_desc,
    long_desc,
    ...imageObj,
  };
  const product = new Product(productData);

  product
    .save()
    .then((result) => {
      res
        .status(201)
        .json({ message: "Add new product process is successful!" });
    })
    .catch((err) => {
      console.log("Error in add new product: ", err);
      res.json({ message: err });
    });
};

// Action for edit product
exports.postEditProduct = async (req, res, next) => {
  const productInfor = req.body.productInfor;
  const productID = productInfor.productID;

  // Check validation input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: errors.array()[0].msg,
      isErrorValidate: true,
    });
  }

  const newProductInfor = await Product.findByIdAndUpdate(
    productID,
    { $set: productInfor },
    { new: true, runValidators: true }
  );

  res.status(201).json({ message: "Edit product process is successful!" });
};

// Action for delete product by productID
exports.postDeleteProduct = (req, res, next) => {
  const productID = req.body.productID;

  // Check if hotel is in transaction
  Product.findByIdAndDelete(productID)
    .then((result) => {
      return res.status(201).json({ message: "Delete product is successful" });
    })
    .catch((err) => console.log("Error in delete product by productID: ", err));
};
