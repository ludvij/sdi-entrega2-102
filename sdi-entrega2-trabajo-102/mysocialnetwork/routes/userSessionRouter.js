const express = require('express');
const userSessionRouter = express.Router();

userSessionRouter.use(function (req, res, next) {
	console.log('passing through userSessionRouter')
    if ( req.session.user ) {
        // dejamos correr la petición
        next();
    } else {
        res.redirect('/login');
    }
});
module.exports = userSessionRouter;