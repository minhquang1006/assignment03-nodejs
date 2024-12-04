const Transaction = require("../models/transaction");
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

  // ====================================================
  console.log("========= UserID ==========: ", userID);
  console.log("========= ProductID ==========: ", productID);
  // ====================================================

  // Define a new cart item
  const newCartItem = {
    userID: userID,
    cartData: [{ productId: productID, quantity: quantity }],
  };

  // // Declare some variables
  // let cartArr, indexUser, indexProduct;
  // cartArr = await Cart.find();
  // indexUser = cartArr.findIndex((cart) => cart.userID === userID);

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

  // ====================================================
  console.log("========= UserID ==========: ", userID);
  console.log("========= ProductID ==========: ", productID);
  // ====================================================

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
  // const productID = productArr.productId;
  // const quantity = productArr.quantity;

  // // ====================================================
  // console.log("========= UserID ==========: ", userID);
  // console.log("========= ProductID ==========: ", productID);
  // // ====================================================

  // Tìm và cập nhật
  productArr.map(async (prod) => {
    await Product.findByIdAndUpdate(prod.productId, {
      $inc: { count: -prod.quantity },
    });
  });

  // await Cart.findOneAndUpdate(
  //   { userID: userID, "cartData.productId": productID },
  //   {
  //     // Nếu đã tồn tại productId, cập nhật quantity
  //     $set: { "cartData.$.quantity": quantity },
  //   },
  //   { new: true } // Trả về document đã cập nhật
  // );

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

  // ====================================================
  console.log("========= UserID ==========: ", userID);
  console.log("========= ProductID ==========: ", productID);
  // ====================================================

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

  // ====================================================
  console.log("========= Order Data ==========: ", orderInfor);
  // ====================================================

  const order = new Order(orderInfor);
  order.save();

  // ===================================================
  console.log("Tạo mới order thành công!");
  // ===================================================

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

  // ===================================================
  console.log("Đã gửi email thành công!");
  // ===================================================

  return res
    .status(201)
    .json({ message: "Create order process is successful!" });
};

// Action for delete cart
exports.deleteCart = (req, res, next) => {
  // Get "userID" from "body" property of request
  const userID = req.body.userID;

  // ====================================================
  console.log("========= UserID ==========: ", userID);
  // ====================================================

  Cart.findOneAndDelete({ userID: userID })
    .then((result) => {
      // ===================================================
      console.log("Xoá cart của current user đã thành công!");
      // ===================================================

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

  // =============================================================
  // console.log("===== Body Data =====: ", req.body.productInfor);
  console.log("===== Body Data =====: ", req.body);
  console.log("===== File Upload =====: ", imageArr);
  // =============================================================

  // =================================================================================================
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // ==================================================================
    console.log("===== Validation Error =====: ", errors.array());
    // ==================================================================

    return res.status(422).json({
      message: errors.array()[0].msg,
      isErrorValidate: true,
    });
  }
  // =================================================================================================

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

  // =====================================================================
  imageArr.map((i, index) => {
    console.log("==== img" + index + 1 + " ====: ", i.path);
  });
  // res.json({ message: "OK" });
  // =====================================================================

  product
    .save()
    .then((result) => {
      // ====================================================================
      console.log("===== Add new product is successful! =====");
      // ====================================================================
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
    // ==================================================================
    console.log("===== Validation Error =====: ", errors.array());
    // ==================================================================

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

  // ==============================================================
  console.log("Edit product process is successful!");
  console.log("====== New Product =======: ", newProductInfor);
  // ==============================================================

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

// ===============================================================================================================
// // Action for add new product
// exports.postAddNewProduct = (req, res, next) => {
//   const image = req.files;

//   // =============================================================
//   console.log("===== File Upload =====: ", req.files);
//   console.log("===== Data of Body =====: ", req.body);
//   // =============================================================

//   // Check if the file upload was successful
//   if (!image) {
//     return res.status(422).json({
//       message: "Upload file is not success!",
//       isErrorValidate: true,
//     });
//   }

//   image.map((i, index) => {
//     console.log("==== img" + index + 1 + " ====: ", i.path);
//   });

//   res.json({ message: "OK" });
// };
// ===============================================================================================================

// // Action for delete room by roomID
// exports.postDeleteRoom = (req, res, next) => {
//   const roomID = req.body.roomID;

//   // Check if room is in transaction
//   Transaction.find({ "rooms.roomID": roomID })
//     .then((data) => {
//       if (data.length > 0) {
//         // Room is booked, so deny delete action and send message to client
//         res.json({ message: "Room is booked" });
//       } else {
//         // Room is not booked, so delete room in "rooms" model
//         Room.findByIdAndDelete(roomID).then(async (result) => {
//           // Find all hotel which have "rooms" property includes "id" of deleted room
//           // Tìm tất cả các tài liệu trong collection "hotels" mà thuộc tính "rooms" chứa giá trị "myID"
//           const hotels = await Hotel.find({ rooms: roomID });

//           // Lặp qua từng tài liệu và xoá phần tử bằng với "roomID" khỏi thuộc tính "rooms"
//           for (const hotel of hotels) {
//             // Loại bỏ phần tử bằng "roomID" khỏi mảng "rooms" của hotel
//             hotel.rooms = hotel.rooms.filter(
//               (roomId) => !roomId.equals(roomID)
//             );

//             // Cập nhật lại tài liệu sau khi đã xoá "myID"
//             await hotel.save();
//           }

//           res.json({ message: "Delete room is successful!" });
//         });
//       }
//     })
//     .catch((err) => console.log("Error in delete room by roomID: ", err));
// };

// // Action for add new room
// exports.postAddNewRoom = (req, res, next) => {
//   const hotelID = req.body.requestData.hotelID;
//   const roomData = req.body.requestData.roomData;
//   const room = new Room(roomData);

//   // Save new room to "rooms" model in database
//   room
//     .save()
//     .then(async (result) => {
//       // ====================================================================
//       console.log("===== Add new room data is successful! =====");
//       // ====================================================================

//       // Get id of new item in "rooms" model (new room has just been created)
//       const newRoom = await Room.findOne()
//         .sort({ createdAt: -1 })
//         .select("_id");
//       const newRoomID = newRoom ? newRoom._id : null;

//       // ==================================================
//       console.log("=== Model Room Data ===: ", newRoomID);
//       // ==================================================

//       // Add new room to hotel which is selected
//       const selectedHotel = await Hotel.findById(hotelID);

//       // ==================================================
//       console.log("=== Selected Hotel ===: ", selectedHotel);
//       console.log("=== Hotel-ID ===: ", hotelID);
//       // ==================================================

//       selectedHotel.rooms.push(newRoomID);
//       selectedHotel.save();

//       res.status(200).json({ message: "Add new room process is successful!" });
//     })
//     .catch((err) => {
//       console.log("Error in add new room: ", err);
//       res.json({ message: err });
//     });
// };

// // Action for edit room
// exports.postEditRoom = async (req, res, next) => {
//   const roomData = req.body.roomData;
//   const roomID = roomData._id;

//   const newRoomData = await Room.findByIdAndUpdate(
//     roomID,
//     { $set: roomData },
//     { new: true, runValidators: true }
//   );

//   // ==============================================================
//   console.log("Edit room process is successful!");
//   console.log("====== New Room =======: ", newRoomData);
//   // ==============================================================

//   res.status(200).json({ message: "Edit room process is successful!" });
// };
