let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render("index.twig", { title: 'SdiBook', user: req.session.user });
});

module.exports = router;
