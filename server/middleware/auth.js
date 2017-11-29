module.exports = function (req, res, next) {
  if (req.query.auth) {
    return res.redirect('/404');
  }
  return next();
}