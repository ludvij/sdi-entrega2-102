const {ObjectId} = require("mongodb");
const {checkJWT} = require('./middleware/checkJWT')

module.exports = function (app, usersRepository) {
	app.get('/api/v1.0/friends', [checkJWT(app)], (req, res) => {
		res.send('authenticated')
	})
	// user beacuse you can't get users
	app.post('/api/v1.0/user/login', (req, res) => {
		try {
			let securePassword = app.get('crypto').createHmac('sha256', app.get('clave'))
				.update(req.body.password).digest('hex')
			let filter = {
				email: req.body.email,
				password: securePassword
			}
			usersRepository.findUser(filter, (err, user) => {
				if (err) {
					return res.status(401).json({
						message: "Se ha producido un error al verificar credenciales",
						authenticated: false
					})
				}
				if (user == null) {
					// unauthorized
					return res.status(401).json({
						message: 'Usuario no encontrado',
						authenticated: false
					})
				} else {
					let token = app.get('jwt').sign(
						{user: user.email, time: Date.now() / 1000 },
						app.get('jwt_secret')
					)
					return res.status(200).json({
						message: 'Usuario autorizado',
						authenticated: true,
						token: token
					})
				}
			})		
		} catch (e) {
			return res.status(500).json({
				message: "Se ha producido un error al verificar credenciales",
				authenticated: false
			})
		}
	})
}