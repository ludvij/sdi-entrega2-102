const express = require('express');
const userModel = require("../schemas/schema").User;
const adminSessionRouter = express.Router();
adminSessionRouter.use(function (req, res, next) {
    if (req.session.user) {
        userModel.findOne({email: req.session.user}).exec(function (err, user) {
            if (err)
                console.log(err);
            else {
                if (user.role == "ROLE_ADMIN")
                    next();
                else
                    res.redirect("/");
            }
        });
    } else
        res.redirect("/users/login");
});
module.exports = adminSessionRouter;