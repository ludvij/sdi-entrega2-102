const express = require('express');
const adminSessionRouter = express.Router();
const logger = require('../logger')

adminSessionRouter.use(function (req, res, next) {
    if ( req.session.user && req.session.user.role == "ROLE_ADMIN" ) {
		// LOGS
		logger.info(req.session.user.email + " -> " + req.url)
		// !LOGS
        // dejamos correr la petición
        next();
    } else {
        res.redirect('/login');
	}
});
module.exports = adminSessionRouter;