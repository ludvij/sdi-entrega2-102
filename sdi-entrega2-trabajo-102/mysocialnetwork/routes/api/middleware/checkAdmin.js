module.exports.checkAdmin = (app) => {
	return checker = (req, res, next) => {
		let payload = res.locals.jwtpayload
		if (payload.user.role != "ROLE_ADMIN") {
			return res.status(401).send('No tiene el nivel de permisos necesarios')
		}
		else {
			next()
		}
	}
}