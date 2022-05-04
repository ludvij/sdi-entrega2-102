const {ObjectId} = require("mongodb");
module.exports = function (app, usersRepository, friendshipRepository) {
    app.get('/signup', function (req, res) {
        if(req.session.user == null){
            res.render("signup.twig");
        } else{
            res.redirect("/");
        }
    });
    app.post('/signup', function (req, res) {
        if(req.session.user == null){
            let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let repeatSecurePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.passwordCheck).digest('hex');

            if (securePassword === repeatSecurePassword) {
                usersRepository.createUser(req.body, securePassword, function (err) {
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
        }
    });
    app.get('/login', function (req, res) {
        if(req.session.user == null){
            res.render("login.twig");
        }
    })
    app.post('/login', async function (req, res) {
            if(req.session.user == null){
                let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                    .update(req.body.password).digest('hex');
                let filter = {
                    email: req.body.email,
                    password: securePassword
                }

                await usersRepository.findUser(filter,function (err, user) {
                    if (err) {
                        console.log(err)
                    }
                    if (user == null) {
                        req.session.user = null;
                        res.redirect("/login" + "?message=Datos incorrectos" + "&messageType=alert-danger ");
                    } else {
                        req.session.user = user.email;
                        console.log("logged in as " + user.name + "(" + req.session.user + ")");
                        if(user.role === "ROLE_ADMIN"){
                            res.redirect("/admin/list");
                        } else{
                            res.redirect("/users/list");
                        }
                    }
                });
            }
        }
    )
    app.get('/logout', function (req, res) {
        if(req.session.user != null){
            req.session.user = null;
            res.redirect("/login");
        } else{
            res.redirect("/login");
        }
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
                let lastPage = result.total / 5;
                if (result.total % 5 > 0)
                    lastPage = lastPage + 1;
                let pages = [];
                for (let i = page - 2; i <= page + 2; i++) {
                    if (i > 0 && i <= lastPage) {
                        pages.push(i);
                    }
                }
                usersRepository.findUser({email: req.session.user}, function(err, userFound) {
                    filter = { $or: [{_id : userFound.requestSent},{_id : userFound.requestReceived}]}
                    friendshipRepository.getFriendshipRequests(filter, {}, function(err, requests) {
                        let friendshipRequest = [];
                        requests.forEach((recu) => {
                            if(recu.sender != userFound._id){
                               friendshipRequest.push(recu.receiver.toString())
                            } else {
                                friendshipRequest.push(recu.sender.toString())
                            }
                        });
                        var users2 = [];
                        for (var i = 0; i < result.users.length; i++){
                            let aux = JSON.stringify(result.users[i])
                            let json = JSON.parse(aux)
                            users2.push(json)
                        }
                        let response = {users: users2, pages: pages, currentPage: page, friendshipRequest: friendshipRequest}
                        res.render("users/list.twig", response);
                    })

                })
            }).catch(error => {
                res.send("Se ha producido un error al listar a los usuarios " + error)
            });
        }
    );
    app.get('/users/list/send/:id', async function (req, res) {
        await usersRepository.findUser({email : req.session.user}, function(err, senderUser) {
            usersRepository.findUser({email : req.params.id}, function(err, receiverUser) {
                if(!senderUser.friends.includes(receiverUser)){
                    let filter = {
                        $or : [{$and : [{receiver: senderUser},{sender: receiverUser}]},
                            {$and : [{sender: senderUser},{receiver: receiverUser}]}]
                    };
                    let options = {};
                    friendshipRepository.getFriendshipRequests(filter, options, function(err, friendshipRequests) {
                        if(friendshipRequests.length == 0){
                            friendshipRepository.addFriendshipRequest(senderUser, receiverUser, function(err, friendship) {
                                senderUser.requestSent.push(friendship);
                                receiverUser.requestReceived.push(friendship);
                                senderUser.save();
                                receiverUser.save();
                            });
                        }
                    });
                }
            });
        });
        res.redirect("/users/list");
    });
}