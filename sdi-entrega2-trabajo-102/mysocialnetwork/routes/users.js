const mongoose = require("mongoose");
module.exports = function (app, userModel, usersRepository) {
    app.get('/signup', function (req, res) {
        res.render("signup.twig");
    });
    app.post('/signup', function (req, res) {
        let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let repeatSecurePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.passwordCheck).digest('hex');

        if (securePassword === repeatSecurePassword) {
            let user = new userModel({
                email: req.body.email,
                name: req.body.name,
                surname: req.body.surname,
                password: securePassword,
                role: "ROLE_USER"
            });
            user.save(function (err) {
                if (err) {
                    res.redirect("/signup" + '?message=Se ha producido un error al registrar el usuario: ' + err +
                        "&messageType=alert-danger");
                } else {
                    res.redirect("/login" + '?message=Nuevo usuario registrado. Inicie la sesión.' +
                        "&messageType=alert-info");
                }
            });

        } else {
            res.redirect("/signup" + '?message=Ambas contraseñas deben de ser iguales.' +
                "&messageType=alert-danger");
        }
    });
    app.get('/login', function (req, res) {
        res.render("login.twig");
    })
    app.post('/login', async function (req, res) {
            let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let filter = {
                email: req.body.email,
                password: securePassword
            }

            await userModel.findOne(filter).exec(function (err, user) {
                if (err) {
                    console.log(err)
                }
                if (user == null) {
                    req.session.user = null;
                    res.redirect("/login" + "?message=Datos incorrectos" + "&messageType=alert-danger ");
                } else {
                    req.session.user = user.email;
                    console.log("logged in as " + user.name + "(" + req.session.user + ")");
                    res.redirect("/");
                }
            });
        }
    )
    app.get('/logout', function (req, res) {
        req.session.user = null;
        res.send("El usuario se ha desconectado correctamente");
    })
    app.get('/users/list', async function (req, res) {
            let filter = {
                role: "ROLE_USER"
            }
            let options = {}
            let page = parseInt(req.query.page);
            if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
                page = 1;
            }
            usersRepository.getUsersPg(filter, options, page).then(result => {
                console.log(result)
                let lastPage = result.total / 5;
                if (result.total % 5 > 0)
                    lastPage = lastPage + 1;
                let pages = [];
                for (let i = page - 2; i <= page + 2; i++) {
                    if (i > 0 && i <= lastPage) {
                        pages.push(i);
                    }
                }
                let response = {users: result.users, pages: pages, currentPage: page}
                res.render("users/list.twig", response);
            }).catch(error => {
                res.send("Se ha producido un error al listar a los usuarios " + error)
            });
        }
    )
    ;
}