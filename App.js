const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const authRoutes = require("./routers/auth");
const getDataRouter = require("./routers/getData");
const setDataRouter = require("./routers/setData");

// PART-1: ================================== CREATE SOME VARIABLES TO USE ===============================================
// ConnectString to MongoDB Database
const MONGODB_URL =
  "mongodb+srv://quanganh1006:08032020@clustermongodb.g0asari.mongodb.net/assignment03";

// Create a session store for "ClientApp" to save session data
const clientSessionStore = new MongoDBStore({
  uri: MONGODB_URL,
  collection: "clientSessions",
});

// Create a session store for "AdminApp" to save session data
const adminSessionStore = new MongoDBStore({
  uri: MONGODB_URL,
  collection: "adminSessions",
});

// Kiểm tra lỗi kết nối session store
clientSessionStore.on("error", (error) => {
  console.error("User session store error:", error);
});

adminSessionStore.on("error", (error) => {
  console.error("Admin session store error:", error);
});

// PART-2: =================================== CONFIG FOR UPLOAD FILE ==============================================
// Create "images" folder to store image upload
const imagePath = path.join(__dirname, "images");
if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

// Named for file upload and store this one to "images" folder in project
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/[.\-:]/g, "") + "-" + file.originalname
    );
  },
});

// Filter for type of file to upload file
const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận các định dạng file
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Chỉ chấp nhận các định dạng ảnh!"));

  // if (
  //   file.mimetype === "image/png" ||
  //   file.mimetype === "image/jpg" ||
  //   file.mimetype === "image/jpeg"
  // ) {
  //   cb(null, true);
  // } else {
  //   cb(null, false);
  // }
};

// PART-3: =================================== CREATE SOME MIDDLEWARES TO USE ===========================================
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://deploy-reactapp-assignment03.web.app", // ClientApp (Frontend)
      "https://deploy-asm-reacjs.web.app", // AdminApp (Frontend)
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ========================================================================================
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array(
    "fileUpload",
    5
  )
);

app.use("/images", express.static(path.join(__dirname, "images")));
// ========================================================================================

// app.use(cors()); // Allow to access data between two different domains
app.use(bodyParser.urlencoded({ extended: false })); // Allow to extract data from body property of request
app.use(express.json()); // Allow to extract JSON data from body property of request

// Middleware to create a collection("session") in "assignment03" to store data sessions
app.use(
  "/client",
  session({
    secret: "secretSession", // render a hashcode for ID of session and save to cookie, this cookie is saved in client browser
    resave: false, // Session is not saved after render a response for request
    saveUninitialized: false, // Session is not saved while have no any changes is created by request
    store: clientSessionStore, // Session is created will save to "clientSessionStore" ("clientSessionStore" points to collection("clientSessions") in "assignment02" database)
    // cookie: { httpOnly: false, maxAge: 10 * 1000 },
    cookie: { httpOnly: false, maxAge: 2 * 60 * 60 * 1000 },
  })
);

// ===============================================================================================================
// Middleware to create a collection("session") in "assignment03" to store data sessions
app.use(
  "/admin",
  session({
    secret: "secretSession", // render a hashcode for ID of session and save to cookie, this cookie is saved in client browser
    resave: false, // Session is not saved after render a response for request
    saveUninitialized: false, // Session is not saved while have no any changes is created by request
    store: adminSessionStore, // Session is created will save to "adminSessionStore" ("adminSessionStore" points to collection("adminSessions") in "assignment02" database)
    // cookie: { httpOnly: false, maxAge: 50 * 1000 },
    cookie: { httpOnly: false, maxAge: 2 * 60 * 60 * 1000 },
  })
);
// ===============================================================================================================

// PART-3: =============================== CALL ROUTERS FOR DIFFERENT PAGES IN APP PROJECT ===========================
// Authentication Routers:
app.use(authRoutes);
app.use(getDataRouter);
app.use(setDataRouter);

// PART-4: =================================== CREATE SEVER AND CONNECT TO SEVER =====================================
// Call the "connect()" method of mongoose to connect to "assignment03" database ("assignment03" is a MongoDB database)
const PORT = process.env.PORT || 5000;
mongoose
  .connect(MONGODB_URL)
  .then((connectResult) => {
    app.listen(PORT, () => {
      console.log("Server is running in port " + PORT);
    });
  })
  .catch((err) => console.log("Error information: ", err));
