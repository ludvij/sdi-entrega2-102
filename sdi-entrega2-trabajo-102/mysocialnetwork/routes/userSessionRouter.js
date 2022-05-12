const express = require('express');
const userSessionRouter = express.Router();
const logger = require('../logger')

userSessionRouter.use((req, res, next) => {
	if ( req.session.user ) {
		// LOGS		
		logger.info(req.session.user.email + " -> " + req.originalUrl)
		// !LOGS
        // dejamos correr la petición
        next();
    } else {
        res.redirect('/login');
    }
});
module.exports = userSessionRouter;