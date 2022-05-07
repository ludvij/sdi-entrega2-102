const express = require('express');
const adminSessionRouter = express.Router();

adminSessionRouter.use(function (req, res, next) {
    if ( req.session.user && req.session.user.role == "ROLE_ADMIN" ) {
        // dejamos correr la petición
        next();
    } else {
        res.redirect('/login');
	}
});
module.exports = adminSessionRouter;