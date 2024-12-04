exports.checkAuthen = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    // =======================================
    console.log("==== Middlerware is running ===== ");
    console.log("==== Session =====: ", req.session);
    // =======================================
    return res.json({ message: "Not logged in" });
  }
  next();
};
