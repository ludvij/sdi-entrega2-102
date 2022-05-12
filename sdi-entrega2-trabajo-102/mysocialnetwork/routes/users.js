const logger = require('../logger')

module.exports = function (app, usersRepository, friendshipRequestRepository) {
    app.get('/signup', (req, res) => {
        if (req.session.user == null) {
            res.render("signup.twig", {user: req.session.user});
        } else {
            res.redirect("/");
        }
    });
    app.post('/signup', async (req, res) => {
        if (req.session.user == null) {
            let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let repeatSecurePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.passwordCheck).digest('hex');

            if (securePassword !== repeatSecurePassword) {
				return res.redirect("/signup" + '?message=Ambas contraseñas deben de ser iguales.' +
					"&messageType=alert-danger");
			}
			try {
				let user = await usersRepository.createUser(req.body, securePassword)
				// LOGS
				logger.info('created user: ' + user.email)
				// !LOGS
				return res.redirect("/login" + '?message=Nuevo usuario registrado. Inicie la sesión.' +
					"&messageType=alert-info");
			} catch (err) {
				if (err.code == 11000) {
					return res.redirect("/signup" + '?message=Se ha producido un error al registrar el usuario: Usuario ya existente.'+
						'&messageType=alert-danger');
				} else {
					return res.redirect("/signup" + '?message=Se ha producido un error al registrar el usuario: ' + err +
						"&messageType=alert-danger");
				}
			}

        }
    });
    app.get('/login', (req, res) => {
        if (req.session.user == null) {
            res.render("login.twig", {user: req.session.user});
        } else {
			if (req.session.user.role === "ROLE_ADMIN") 
				return res.redirect('/admin/list')
			else 
				return res.redirect('/users/list')
				
		}
    })
    app.post('/login', async (req, res) => {
        if (req.session.user == null) {
            let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let filter = {
                email: req.body.email, password: securePassword
            }
			try {
				let user = await usersRepository.findUser(filter)
				if (user == null) {
					req.session.user = null;
					return res.redirect("/login" + "?message=Datos incorrectos" + "&messageType=alert-danger ");
				} else {
					req.session.user = user;
					// LOGS
					logger.info(user.email + ' has logged in')
					// !LOGS
					if (user.role === "ROLE_ADMIN") {
						return res.redirect("/admin/list");
					} else {
						return res.redirect("/users/list");
					}
				}
			} catch (error) {
				logger.error(error)
				res.status(500).send(error)
			}
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

    app.get('/users/list', async (req, res) => {
        let filter = {
            role: "ROLE_USER",
            email: {$ne: req.session.user.email}
        }
        // busqueda por nombre, apellido o email
        if (req.query.search != null && typeof (req.query.search) != "undefined" && req.query.search != "") {
            filter.$or = [
				{name: {$regex: ".*" + req.query.search + ".*", $options: 'i'}},
				{surname: {$regex: ".*" + req.query.search + ".*", $options: 'i'}},
				{email: {$regex: ".*" + req.query.search + ".*", $options: 'i'}}
			];
        }

        let page = parseInt(req.query.page);
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
            page = 1;
        }
		// get users in page
        let {users, total} = await usersRepository.getUsersPg(filter, 'name email surname', page)
		// ???
		let lastPage = total / 5;
		if (total % 5 > 0)
			lastPage = lastPage + 1;
		let pages = [];
		for (let i = page - 2; i <= page + 2; i++) {
			if (i > 0 && i <= lastPage) {
				pages.push(i);
			}
		}
		// can't be null
		let user = await usersRepository.findUser({email: req.session.user.email})

		filter = {
			$or: [
				{sender : user._id},
				{receiver : user._id},
				{sender: req.session.user._id},
				{receiver: req.session.user._id}
			]
		}

		// get friendship request from user
		let requests = await friendshipRequestRepository.getFriendshipRequests(filter, {})
		let friendshipRequest = [];
		requests.forEach((recu) => {
            if(recu.sender.toString() != req.session.user._id){
                friendshipRequest.push(recu.sender.toString())
            }else {
                friendshipRequest.push(recu.receiver.toString())
            }
		});
        req.session.user.friends.forEach((fr) => {
            friendshipRequest.push(fr.toString());
        })
		var users2 = [];

		for (var i = 0; i < users.length; i++){
			let aux = JSON.stringify(users[i])
			let json = JSON.parse(aux)
			users2.push(json)
		}
		let response = {
			users: users2,
			pages: pages,
			currentPage: page,
			friendshipRequest: friendshipRequest,
			search: req.query.search,
			user: req.session.user
		}
		res.render("users/list.twig", response);

    });

    app.get('/users/requests/list', async (req, res) => {
        if (req.session.user == null) {
            res.render("login.twig");
        }
        let page = parseInt(req.query.page);
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
            page = 1;
        }
        let user = await usersRepository.findUser({email: req.session.user.email})

		let requests = [];
		let req_rec = await friendshipRequestRepository.findFriendshipRequests({receiver: user._id})
		for (let req of req_rec) {
			let sender = await usersRepository.findUserById(req.sender)
			requests.push({requestId: req._id, sender})
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
		res.render("friendshipRequest/list.twig", {requests:requestsPaged, pages:pages, user: req.session.user})

    })

    app.get('/users/requests/list/accept/:id', async (req, res) => {
		const request = await friendshipRequestRepository.findFriendshipRequest({_id: req.params.id});
		if (!request) 
			return res.redirect('/users/requests/list');

		const sender = await usersRepository.findUserById(request.sender);
		const receiver = await usersRepository.findUserById(request.receiver);

		if (!receiver.friends.includes(sender._id) && !sender.friends.includes(receiver._id)) {
			await usersRepository.setFriendship(receiver, sender);
			await friendshipRequestRepository.deleteFriendshipRequest(req.params.id);
			// LOGS
			logger.info(`${req.session.user.email} has accepted a friendship request from: [${sender.email}]`)
			// !LOGS
		}
		res.redirect('/users/requests/list');
	})

    app.get('/users/requests/list/decline/:id', async (req, res) => {
		let fr = await friendshipRequestRepository.findFriendshipRequest({_id: req.params.id})
		if (!fr) 
			return res.redirect('/users/requests/list');
		// check the user declining is the user receiving the request
		if (fr.receiver != req.session.user._id) {
			return res.status(401).send('not your friendship request')
		}
		await friendshipRequestRepository.deleteFriendshipRequest(req.params.id)

		let {email} = await usersRepository.findUser({_id: fr.sender}, "email")
		// LOGS
		logger.info(`${req.session.user.email} has declined a friendship request from: [${email}]`)
		// !LOGS
		res.redirect('/users/requests/list');

    });
  
  app.get('/users/list/send/:id', async (req, res) => {
        let senderUser = await usersRepository.findUser({email : req.session.user.email})
		let receiverUser = await usersRepository.findUser({email : req.params.id})

		// not friends
		if(!senderUser.friends.includes(receiverUser)){
			// check there are not requests arlready sent
			let filter = {
				$or : [
					{$and : [{receiver: senderUser},{sender: receiverUser}]},
					{$and : [{sender: senderUser},{receiver: receiverUser}]}
				]
			};
			let options = {};
			let frienshipRequests = await friendshipRequestRepository.getFriendshipRequests(filter, options)
			if(frienshipRequests.length == 0){
				await friendshipRequestRepository.addFriendshipRequest(senderUser, receiverUser)
				// LOGS
				logger.info(`${req.session.user.email} has sent a friendship request to: [${receiverUser.email}]`)
				// !LOGS
			}
		}
        res.redirect("/users/list");
    });
    app.get('/friends/:id', async (req, res) => {
		if (req.params.id !== req.session.user._id) {
			return res.status(403).send('No puedes ver la lista de amigos de otro')
		}
        let filter = {
            role: "ROLE_USER",
            _id: req.params.id
        }
        let page = parseInt(req.query.page);
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
            page = 1;
        }

		try {
			let result = await usersRepository.getFriendsPg(page, filter, 'friends')
			let lastPage = result.total / 5;
			if (result.total % 5 > 0)
				lastPage = lastPage + 1;
			let pages = [];
			for (let i = page - 2; i <= page + 2; i++) {
				if (i > 0 && i <= lastPage) {
					pages.push(i);
				}
			}
			let response = {friends: result.users, pages: pages, currentPage: page, user: req.session.user}
			res.render("users/friends.twig", response);

		} catch (error) {
			res.send("Se ha producido un error al listar a los amigos " + error)
		}
    })
}
