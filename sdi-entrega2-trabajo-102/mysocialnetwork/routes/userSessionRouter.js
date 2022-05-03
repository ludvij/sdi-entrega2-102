const express = require('express');
const userModel = require("../schemas/schema").User;
const userSessionRouter = express.Router();
userSessionRouter.use(function (req, res, next) {
    if (req.session.user) {
        userModel.findOne({email: req.session.user}).exec(function (err, user) {
            if (err)
                console.log(err);
            else {
                if (user.role == "ROLE_USER")
                    next();
                else
                    res.redirect("/");
            }
        });
    } else
        res.redirect("/login");
});
module.exports = userSessionRouter;