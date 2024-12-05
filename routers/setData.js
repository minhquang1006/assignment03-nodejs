const express = require("express");
const router = express.Router();
const setDataController = require("../controllers/setData");
const { checkAuthen } = require("../middleware/CheckAuthen");
const { body } = require("express-validator");
const { parseToJSON } = require("../middleware/parseToJSON");

// ======================================= PART-1: ROUTERS FOR CLIENT-APP ========================================

// Router for add a new cart to "cart" model
router.post("/client/add-cart", checkAuthen, setDataController.addCart);

// Router for update cart of current user
router.post("/client/update-cart", checkAuthen, setDataController.updateCart);

// Router for delete an item in cart of current user
router.post(
  "/client/delete-item-cart",
  checkAuthen,
  setDataController.deleteItemInCart
);

// Router for create a new order to "order" model
router.post("/client/create-order", checkAuthen, setDataController.createOrder);

// Router for delete cart of current user
router.post("/client/delete-cart", checkAuthen, setDataController.deleteCart);

// update-quantity-product
// Router for update quantity of products after completed order
router.post(
  "/client/update-quantity-product",
  checkAuthen,
  setDataController.updateQuantityOfProducts
);

// ======================================= PART-2: ROUTERS FOR ADMIN-APP ========================================

// Router for add new product
router.post(
  "/admin/add-product",
  checkAuthen,
  parseToJSON,
  [
    body("name")
      .isString()
      .isLength({ min: 3 })
      .withMessage('The "name" is string and at least 3 character')
      .trim(),
    body("category")
      .isString()
      .isLength({ min: 3 })
      .withMessage('The "category" is string and at least 3 character')
      .trim(),
    body("price").isFloat().withMessage('The "price" must be a number'),
    body("short_desc")
      .isLength({ min: 5, max: 200 })
      .withMessage(
        'The "Short Description" must be string: minimum is 5 and maximum is 200 characters'
      )
      .trim(),
    body("long_desc")
      .isLength({ min: 5, max: 600 })
      .withMessage(
        'The "Long Description" must be string: minimum is 5 and maximum is 600 characters'
      )
      .trim(),
  ],
  setDataController.postAddNewProduct
);

// Router for edit product
router.post(
  "/admin/edit-product",
  checkAuthen,
  [
    body("productInfor.name")
      .isString()
      .isLength({ min: 3 })
      .withMessage('The "name" is string and at least 3 character')
      .trim(),
    body("productInfor.category")
      .isString()
      .isLength({ min: 3 })
      .withMessage('The "category" is string and at least 3 character')
      .trim(),
    body("productInfor.price")
      .isFloat()
      .withMessage('The "price" must be a number'),
    body("productInfor.short_desc")
      .isLength({ min: 5, max: 200 })
      .withMessage(
        'The "Short Description" must be string: minimum is 5 and maximum is 200 characters'
      )
      .trim(),
    body("productInfor.long_desc")
      .isLength({ min: 5, max: 600 })
      .withMessage(
        'The "Long Description" must be string: minimum is 5 and maximum is 600 characters'
      )
      .trim(),
  ],
  setDataController.postEditProduct
);

// Router for delete hotel by hotelID
router.post(
  "/admin/delete-product",
  checkAuthen,
  setDataController.postDeleteProduct
);

// Export to use
module.exports = router;
