require("dotenv").config();
const jwt = require("jsonwebtoken");

// This function to create a JWT token string (encoding)
const createJWTToken = (payloadData) => {
  const secretString = process.env.jwtString;
  let jwtToken = null;
  try {
    jwtToken = jwt.sign(payloadData, secretString);
    // =====================================
    console.log(jwtToken);
    // =====================================
    return jwtToken;
  } catch (error) {
    console.log("Create JWT Token is failed: ", error);
  }
};

// This function to verify a JWT token string (decoding)
const verifyJWTToken = (token) => {
  const secretString = process.env.jwtString;
  let decoded = null;
  try {
    decoded = jwt.verify(token, secretString);
    // =================================================
    console.log("===== Decoded =====: ", decoded);
    // =================================================
  } catch (error) {
    console.log("Verify Token is failed: ", err);
  }

  return decoded;
};

module.exports = {
  createJWTToken,
  verifyJWTToken,
};
