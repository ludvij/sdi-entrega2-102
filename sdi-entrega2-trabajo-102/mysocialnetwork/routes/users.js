const mongoose = require("mongoose");
const {findUser} = require("../repositories/usersRepository");
module.exports = function (app, userModel, usersRepository, friendshipRequestRepository) {
    app.get('/signup', function (req, res) {
        if (req.session.user == null) {
            res.render("signup.twig", {user: req.session.user});
        } else {
            res.redirect("/");
        }
    });
    app.post('/signup', function (req, res) {
        if (req.session.user == null) {
            let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let repeatSecurePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.passwordCheck).digest('hex');

            if (securePassword === repeatSecurePassword) {
                usersRepository.createUser(req.body, securePassword, function (err) {
                    if (err) {
						if (err.code == 11000) {
							res.redirect("/signup" + '?message=Se ha producido un error al registrar el usuario: Usuario ya existente.'+
								'&messageType=alert-danger');
						} else {
							res.redirect("/signup" + '?message=Se ha producido un error al registrar el usuario: ' + err +
								"&messageType=alert-danger");
						}
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
        if (req.session.user == null) {
            res.render("login.twig", {user: req.session.user});
        } else {
			if (req.session.user.role === "ROLE_ADMIN") 
				return res.redirect('/admin/list')
			else 
				return res.redirect('/users/list')
				
		}
    })
    app.post('/login', async function (req, res) {
        if (req.session.user == null) {
            let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let filter = {
                email: req.body.email, password: securePassword
            }

            await usersRepository.findUser(filter, function (err, user) {
                if (err) {
                    console.log(err)
                }
                if (user == null) {
                    req.session.user = null;
                    return res.redirect("/login" + "?message=Datos incorrectos" + "&messageType=alert-danger ");
                } else {
                    req.session.user = user.email;
                    console.log("logged in as " + user.name + "(" + req.session.user + ")");
                    if (user.role === "ROLE_ADMIN") {
                        return res.redirect("/admin/list");
                    } else {
                        return res.redirect("/users/list");
                    }
                }
            });
        }
		else {
			if (req.session.user.role === "ROLE_ADMIN") 
				return res.redirect('/admin/list')
			else 
				return res.redirect('/users/list')
				
		}
    })
    app.get('/logout', function (req, res) {
        if (req.session.user != null) {
            req.session.user = null;
            res.redirect("/login");
        } else {
            res.redirect("/login");
        }
    })
    app.get('/users/list', async function (req, res) {
        let filter = {
            role: "ROLE_USER",
            email: {$ne: req.session.user}
        }
        let options = {}
        // busqueda por nombre, apellido o email
        if (req.query.search != null && typeof (req.query.search) != "undefined" && req.query.search != "") {
            filter.$or = [
				{name: 
					{$regex: ".*" + req.query.search + ".*", $options: 'i'}
				},
				{surname: 
					{$regex: ".*" + req.query.search + ".*", $options: 'i'}
				},
				{email: 
					{$regex: ".*" + req.query.search + ".*", $options: 'i'}
				}
			];
        }

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
            let response = {
				users: result.users, 
				pages: pages, 
				currentPage: page, 
				search: req.query.search,
				user: req.session.user
			}
            res.render("users/list.twig", response);
        }).catch(error => {
            res.send("Se ha producido un error al listar a los usuarios " + error)
        });
    });

    app.get('/users/list', async function (req, res) {
        let filter = {
            role: "ROLE_USER",
            email: {$ne: req.session.user}
        }
        let options = {}
        // busqueda por nombre, apellido o email
        if (req.query.search != null && typeof (req.query.search) != "undefined" && req.query.search != "") {
            filter.$or = [
				{name: 
					{$regex: ".*" + req.query.search + ".*", $options: 'i'}
				},
				{surname: 
					{$regex: ".*" + req.query.search + ".*", $options: 'i'}
				},
				{email: 
					{$regex: ".*" + req.query.search + ".*", $options: 'i'}
				}
			];
        }

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
            usersRepository.findUser({email: req.session.user.email}, function(err, userFound) {
                filter = { $or: [{_id : userFound.requestSent},{_id : userFound.requestReceived}]}
                friendshipRequestRepository.getFriendshipRequests(filter, {}, function(err, requests) {
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
                    let response = {users: users2, pages: pages, currentPage: page, friendshipRequest: friendshipRequest,
                        search: req.query.search,
                        user: req.session.user}
                    res.render("users/list.twig", response);
                })

            })
        }).catch(error => {
            res.send("Se ha producido un error al listar a los usuarios " + error)
        });
    });

    app.get('/users/requests/list', async function (req, res) {
        if (req.session.user == null) {
            res.render("login.twig");
        }
        let page = parseInt(req.query.page);
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
            page = 1;
        }
        await usersRepository.findUser({email: req.session.user}, async function (err, user) {
            if (err) {
                console.log(err)
            }
            let requests = [];
            for (let i = 0; i < user.requestReceived.length; i++){
                let request = await friendshipRequestRepository.findFriendshipRequest({_id: user.requestReceived[i].toString()});
                let sender = await usersRepository.findUserById(request.sender);
                requests.push({requestId: request._id, sender})
            }

            //Paginación
            let lastPage = requests.length / 5;
            if (requests.length % 5 > 0)
                lastPage = lastPage + 1;
            let pages = [];
            for (let i = page - 2; i <= page + 2; i++) {
                if (i > 0 && i <= lastPage) {
                    pages.push(i);
                }
            }
            let start = (page - 1) * (requests.length - 1);
            let end = Math.min(start + 5, requests.length)
            let requestsPaged = requests.slice(start, end);
            res.render("friendshipRequest/list.twig", {requests:requestsPaged, pages:pages})

        });
    })

    app.get('/users/requests/list/accept/:id', async function (req, res) {
        if (req.session.user != null) {
           const request = await friendshipRequestRepository.findFriendshipRequest({_id: req.params.id});

           const sender = await usersRepository.findUserById(request.sender);
           const receiver = await usersRepository.findUserById(request.receiver);

           if (!receiver.friends.includes(sender._id) && !sender.friends.includes(receiver._id)) {
               const request = await friendshipRequestRepository.deleteFriendshipRequest(req.params.id);
               if (request.deletedCount > 0) {
                   await usersRepository.setFriendship(req.params.id ,receiver, sender);
                   res.redirect('/users/requests/list');
               }
           }
        } else {
            res.render("login.twig");
        }
    });

    app.get('/users/requests/list/decline/:id', async function (req, res) {
        if (req.session.user != null) {
            const request = await friendshipRequestRepository.findFriendshipRequest({_id: req.params.id});

            const sender = await usersRepository.findUserById(request.sender);
            const receiver = await usersRepository.findUserById(request.receiver);

            if (!receiver.friends.includes(sender._id) && !sender.friends.includes(receiver._id)) {
                const request = await friendshipRequestRepository.deleteFriendshipRequest(req.params.id);
                if (request.deletedCount > 0) {
                    await usersRepository.deleteRequests(req.params.id ,receiver, sender);
                    res.redirect('/users/requests/list');
                }
            }
        } else {
            res.render("login.twig");
        }
    });
  
  app.get('/users/list/send/:id', async function (req, res) {
        await usersRepository.findUser({email : req.session.user.email}, function(err, senderUser) {
            usersRepository.findUser({email : req.params.id}, function(err, receiverUser) {
                if(!senderUser.friends.includes(receiverUser)){
                    let filter = {
                        $or : [{$and : [{receiver: senderUser},{sender: receiverUser}]},
                            {$and : [{sender: senderUser},{receiver: receiverUser}]}]
                    };
                    let options = {};
                    friendshipRequestRepository.getFriendshipRequests(filter, options, function(err, friendshipRequests) {
                        if(friendshipRequests.length == 0){
                            friendshipRequestRepository.addFriendshipRequest(senderUser, receiverUser, function(err, friendship) {
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