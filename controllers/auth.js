const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/user");

// ====================================== PART-1: ACTIONS FOR CLIENT-APP =======================================
exports.checkLogin = async (req, res, next) => {
  const session = req.session;
  return res.json({ isLoggedIn: session.isLoggedIn });
};

exports.getCurrentUserInfor = async (req, res, next) => {
  const session = req.session;
  return res.json({
    userID: session?.user?._id,
    userEmail: session?.user?.email,
    fullName: session?.user?.fullName,
    lastName: session?.user?.fullName.split(" ").at(-1),
    phone: session?.user?.phone,
    role: session?.user?.role,
    isLoggedIn: session?.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: errors.array()[0].msg,
      isAuthError: true,
    });
  }

  // Get user data by email
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.json({
          message: "Email or Password is incorrect, check again!",
          isAuthError: true,
        });
      }

      // Check if entered password is exactly by "bcrypt.compare()" method
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (!doMatch) {
            // Password is not exactly:
            return res.json({
              message: "Email or Password is not exactly!",
              isAuthError: true,
            });
          } else {
            // Password is exactly: assign true value to "isLoggedIn" property and user data to "user" property in the session
            req.session.isLoggedIn = true;
            req.session.user = user; // ===== Dùng gói "Express-Session" để lưu dữ liệu của đối tượng "user" vào CSDL "MongoDB" tại thuộc tính "user" trong collection("session"): Collection("session") được xác định theo code // ========= MIDDLEWARE TO CREATE A SESSION ========== bên file "app.js"
            try {
              req.session.save();
            } catch (error) {
              console.log("Creating session-cookie is failed", error);
            }

            return res.json({
              message: "Successful",
              isAuthError: false,
              userID: user._id,
              userEmail: user.email,
              fullName: user.fullName,
              lastName: user.fullName.split(" ").at(-1),
              phone: user.phone,
              isLoggedIn: req.session.isLoggedIn,
            });
          }
        })
        .catch((err) => {
          console.log("Error information: ", err);
        });
    })
    .catch((err) => console.log("Error information: ", err));
};

exports.postSignup = (req, res, next) => {
  const reqBody = req.body;
  const fullName = reqBody.fullName;
  const email = reqBody.email;
  const password = reqBody.password;
  const phone = reqBody.phone;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("===== Validation Error =====: ", errors.array());
    return res.status(422).json({
      message: errors.array()[0].msg,
      isAuthError: true,

      // errorInputArr: errors.array(),
      // errors.array(): trả về một mảng các đối tượng mà mỗi đối tượng là một input có lỗi xác thực
      // mỗi đối tượng đó có cấu trúc như sau:
      // {
      //   type: 'field',
      //   value: 'giá trị được người dùng nhập vào input',
      //   msg: 'Đoạn thông báo lỗi do lập trình viên tạo ra bằng hàm "withMessage()" khi sử dụng gói "express-validator",
      //   path: 'tên input có lỗi: name = "email" ',
      //   location: 'body' => input này được lấy ra từ "body" của request: req.body
      // }
    });
  }

  // Encrypt the password to hash code by bcrypt
  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        fullName: fullName,
        email: email,
        password: hashedPassword,
        phone: phone,
      });
      return user.save();
    })
    .then(() => {
      return res.json({ message: "Successful", isAuthError: false }); // Xem lai xem co can dung "isAuthError" ko?
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err });
    });
};

// exports.postLogout = (req, res, next) => {
exports.getLogout = (req, res, next) => {
  // - Khi user click vào logout thì session lưu trên MongoDB (xem trong MongoDB compass) sẽ bị xoá,
  // nhưng cookie lưu trên trình duyệt(xem trong tab Application) sẽ không bị xoá
  // - Khi user click vào login trở lại thì session mới sẽ được tạo ra và lưu trên database và một cookie mới
  //  cũng được tạo ra lưu trên trình duyệt và ghi đè vào cookie cũ

  // Delete session in server and redirect to home page
  req.session.destroy((err) => {
    console.log("Error information for logout: ", err);
  });
  console.log("====== Delete session already ======");
  res.json({ message: "Logging out is successful" });
};

// ====================================== PART-2: ACTIONS FOR ADMIN-APP ======================================
exports.postLoginAdmin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: errors.array()[0].msg,
      isAuthError: true,
    });
  }

  // Get user data by email
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.json({
          message: "User is not exist, recheck your email please!",
          isAuthError: true,
        });
      }

      // Check if entered password is exactly by "bcrypt.compare()" method
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (!doMatch) {
            // Password is not exactly:
            return res.json({
              message: "Email or Password is not exactly!",
              isAuthError: true,
            });
          }

          if (user.role === "customer") {
            // User is not "admin" or "consultant":
            return res.json({
              message: "You have not permission to access admin page!",
              isAuthError: true,
            });
          }

          // User is exist, Password is exactly, user is admin: assign true value to "isLoggedIn" property and user data to "user" property in the session
          req.session.isLoggedIn = true;
          req.session.user = user; // ===== Dùng gói "Express-Session" để lưu dữ liệu của đối tượng "user" vào CSDL "MongoDB" tại thuộc tính "user" trong collection("session"): Collection("session") được xác định theo code // ========= MIDDLEWARE TO CREATE A SESSION ========== bên file "app.js"
          try {
            req.session.save();
          } catch (error) {
            console.log("Creating session-cookie is failed", err);
          }

          return res.json({
            message: "Successful",
            isAuthError: false,
          });
        })
        .catch((err) => {
          console.log("Error information: ", err);
        });
    })
    .catch((err) => console.log("Error information: ", err));
};
