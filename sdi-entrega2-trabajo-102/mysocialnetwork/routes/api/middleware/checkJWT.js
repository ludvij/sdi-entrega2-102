
module.exports.checkJWT = (app) => {
	return checker = (req, res, next) => {
		// get the jwt token from the header
		const token = req.headers.token

		try {
			let JWTPayload = jwapp.get('jwt').verify(token, app.get('jwt_secret')) 
			if(Date.now() >= JWTPayload.exp * 1000) {
				res.status(401)
					.header('WWW-Authenticate', 'Basic realm="session has ended, pelase log in again"')
					.send("The token has expired, please log in again")
				return;
			}
			res.locals.jwtPayload = JWTPayload; 
		} catch (error) {
			res.status(401)
				.header('WWW-Authenticate', 'Basic realm="you need to be logged in"')
				.send("an error has happened while authorizing");
			return;
		}

		next()
	}
}