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

					return res.status(200).json({
						message: 'Usuario autorizado',
						authenticated: true,
						token: token,
					})
				}
				
			} catch (err) {
				return res.status(500).json({
					message: "Se ha producido un error al verificar credenciales",
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

	app.post('/api/v1.0/conversation', [checkJWT(app)], async (req, res) => {
		const sender = await usersRepository.findUserById(req.body.sender);
		const receiver = await usersRepository.findUserById(req.body.receiver);

		if (sender.email !== res.locals.jwtPayload.user && receiver.email !== res.locals.jwtPayload.user)
			return res.status(403).json({
				message: "No estás autorizado para acceder a esta conversación",
			});

		const filter = {
			$or: [
				{$and: [{sender: sender._id}, {receiver: receiver._id}]},
				{$and: [{sender: receiver._id}, {receiver: sender._id}]}
			]
		}
		const conversation = messageRepository.findConversation(filter);

		return res.status(200).send(conversation);
	})
}