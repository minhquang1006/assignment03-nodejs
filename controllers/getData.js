const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const User = require("../models/user");

// Get product data
exports.getProducts = (req, res, next) => {
  Product.find().then((data) => {
    res.status(200).json(data);
  });
};

// Get product by productID
exports.getProductById = (req, res, next) => {
  const productID = req.body.productID;
  Product.findById(productID).then((data) => {
    res.status(200).json(data);
  });
};

// Get all carts data
exports.getCarts = (req, res, next) => {
  Cart.find().then((data) => {
    res.status(200).json(data);
  });
};

// Get cart data of current user
exports.getCartOfCurrentUser = (req, res, next) => {
  const userID = req.body.userID;
  Cart.findOne({ userID: userID })
    .populate("cartData.productId")
    .then((data) => {
      if (data) {
        const cartOfCurrentUser = data.cartData.map((item) => {
          return { productItem: item.productId, quantity: item.quantity };
        });
        res.status(200).json({ userID: userID, cartData: cartOfCurrentUser });
      } else {
        res.status(200).json(null);
      }
    });
};

// Get cart data of current user
exports.getOrderOfCurrentUser = (req, res, next) => {
  const userID = req.body.userID;
  Order.find({ "user.userID": userID })
    .populate("products.productId")
    .then((data) => {
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(200).json(null);
      }
    });
};

// Get order by orderID
exports.getOrderByOrderID = (req, res, next) => {
  const orderID = req.body.orderID;
  if (orderID) {
    Order.findById(orderID)
      .populate("products.productId")
      .then((data) => {
        if (data) {
          res.status(200).json(data);
        } else {
          res.status(200).json(null);
        }
      });
  } else {
    res.status(200).json(null);
  }
};

// Get all users for dashboard page in ADMIN-APP
exports.getAllUsers = (req, res, next) => {
  User.find()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log("Error in get all users function: ", err);
      res.send({ message: err });
    });
};

// Get all transaction for dashboard page in ADMIN-APP
exports.getAllOrders = (req, res, next) => {
  Order.find()
    .populate("products.productId")
    .then((data) => {
      // Sort trasactions by most recent order date
      const sortedData = data.sort((a, b) => b.updatedAt - a.updatedAt);
      res.status(200).json(sortedData);
    })
    .catch((err) => {
      console.log("Error in get all orders data function: ", err);
      res.send({ message: err });
    });
};
