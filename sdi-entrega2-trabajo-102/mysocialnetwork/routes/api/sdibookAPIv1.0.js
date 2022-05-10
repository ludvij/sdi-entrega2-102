const {ObjectId} = require("mongodb");
const {checkJWT} = require('./middleware/checkJWT')

module.exports = function (app, usersRepository, messageRepository) {
	app.get('/api/v1.0/friends', [checkJWT(app)], async (req, res) => {
		const {user} = res.locals.jwtPayload
		let {friends} = await usersRepository.findAndPopulate({_id: user._id}, 'friends')
		friends.sort((a, b) => {
			return a.name.localeCompare(b.name, undefined, {
				numeric: true,
				sensitivity: 'base'
			})
		})
		return res.send(friends)
		
	})
	app.post('/api/v1.0/login', async (req, res) => {
		try {
			let securePassword = app.get('crypto').createHmac('sha256', app.get('clave'))
				.update(req.body.password).digest('hex')
			let filter = {
				email: req.body.email,
				password: securePassword
			}
			try {
				let user = await usersRepository.findUser(filter)
				if (user == null) {
					// unauthorized
					return res.status(401).json({
						message: 'Usuario o contraseña incorrecta',
						authenticated: false
					})
				} else {

					const payload = {
						user: user
					}
					let token = app.get('jwt').sign(payload, app.get('jwt_secret'),{expiresIn: '1h'})
					console.log(user)
					return res.status(200).json({
						message: 'Usuario autorizado',
						authenticated: true,
						token: token,
					})
				}
				
			} catch (err) {
				return res.status(500).json({
					message: "Se ha producido un error al verificar credenciales " + err,
					authenticated: false
				})
			}
		}catch (error) {
			return res.status(401).json({
				message: "Se ha producido un error al verificar credenciales",
				authenticated: false
			})
		}
	})
  
	app.get('/api/v1.0/conversation/:id', [checkJWT(app)], async (req, res) => {
		const filter = {
			$or: [
				{$and: [{sender: req.params.id}, {receiver: res.locals.jwtPayload.user._id}]},
				{$and: [{sender: res.locals.jwtPayload.user._id}, {receiver: req.params.id}]}
			]
		}
		const conversation = await messageRepository.findConversation(filter);

		return res.status(200).send(conversation);
  })

	app.post('/api/v1.0/message', [checkJWT(app)], async (req, res) => {
		try {
			let message = {
				sender: res.locals.jwtPayload.user._id,
				receiver: req.body.receiver,
				text: req.body.text,
				read: false
			}
			try{
				let receiver = await usersRepository.findUser({_id: new ObjectId(message.receiver)});
				let sender = await usersRepository.findUser({_id: new ObjectId(message.sender)});
				if (receiver.friends.includes(sender._id) && sender.friends.includes(receiver._id)) {
					try{
						await messageRepository.createMessage(message);
						return res.status(200).send({msg: "Se ha enviado el mensaje"});
					}catch (error){
						res.status(500);
						res.json({error: "Se ha producido un error al intentar enviar el mensaje: " + error})
					}

				}else{
					res.status(403);
					res.json({error: "Para enviar mensajes es necesario ser amigos."})
				}
			}catch (error){
				res.status(500);
				res.json({error: "Se ha producido un error al intentar enviar el mensaje: " + error})
			}


		} catch (e) {
			res.status(500);
			res.json({error: "Se ha producido un error al intentar enviar el mensaje: " + e})
		}
	})

	app.get('/api/v1.0/message/:id', [checkJWT(app)], async (req, res) => {
		try {
			let message = await messageRepository.findMessage({_id: req.params.id});
			if (!message.receiver.equals(new ObjectId(res.locals.jwtPayload.user._id)))
				return res.status(403).json({
					message: "No eres el receptor de este mensaje.",
				});
			message.read = true
			await messageRepository.readMessage(message);
			res.status(201);
			res.json({
				message: "Mensaje marcado como leído correctamente.",
				_id: req.body.id
			})
		} catch (e) {
			res.status(500);
			res.json({error: "Se ha producido un error al marcar el mensaje como leído: " + e})
		}
	})
}