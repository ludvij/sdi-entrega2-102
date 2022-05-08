const {ObjectId} = require("mongodb");
const {checkJWT} = require('./middleware/checkJWT')

module.exports = function (app, usersRepository, messageRepository) {
	app.get('/api/v1.0/friends', [checkJWT(app)], (req, res) => {
		res.send('authenticated')
	})
	// user beacuse you can't get users
	app.post('/api/v1.0/user/login', async (req, res) => {
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
					let token = app.get('jwt').sign(payload, app.get('jwt_secret'),{expires_in: '1h'})
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

	app.post('/api/v1.0/message', async (req, res) => {
		try {
			let message = {
				sender: req.body.sender,
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
}