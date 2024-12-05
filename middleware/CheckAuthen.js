exports.checkAuthen = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.json({ message: "Not logged in" });
  }
  next();
};
