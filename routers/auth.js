const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/user");

// ======================================= PART-1: ROUTERS FOR CLIENT-APP ========================================
// Router for Check Login
router.get("/client/checklogin", authController.checkLogin);

// Router for Get information of current user
router.get("/client/get-current-user", authController.getCurrentUserInfor);

// Router for Login
router.post(
  "/client/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Enter value to password input please!")
      .trim(),
  ],
  authController.postLogin
);

// Router for Signup
router.post(
  "/client/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email exists already!");
          }
        });
      })
      .normalizeEmail(),
    body(
      "password", // (Code-1) - tham số này: để tham chiếu đến thuộc tính cần kiểm tra trên "body" là "newUser.password"
      "please enter a password with only numbers and text and at least 9 characters" // (Code-2) - tham số này: để thông báo lỗi chung cho tất cả các trình xác thực được sử dụng đầng sau "body()" như: "isLength()" và "isAlphanumeric()"
    )
      .isLength({ min: 9 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postSignup
);

// Router for Logout
router.get("/client/logout", authController.getLogout);

// ======================================= PART-2: ROUTERS FOR ADMIN-APP ========================================
// Router for get information of active user
router.get("/admin/getActiveUserInfor", authController.getCurrentUserInfor);

// Router for Check Login
router.get("/admin/checklogin", authController.checkLogin);

// Router for Login
router.post(
  "/admin/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Enter value to password input please!")
      .trim(),
  ],
  authController.postLoginAdmin
);

// Router for Logout
router.get("/admin/logout", authController.getLogout);

// Export to use
module.exports = router;
