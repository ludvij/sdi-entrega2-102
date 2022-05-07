
module.exports.checkJWT = (app) => {
	// reused from my ASW lab group :3
	return checker = (req, res, next) => {
		// get the jwt token from the header
		const token = req.headers.token

		try {
			let JWTPayload = jwapp.get('jwt').verify(token, app.get('jwt_secret')) 
			if(Date.now() >= JWTPayload.exp * 1000) {
				return res.status(401)
					// .header('WWW-Authenticate', 'Basic realm="session has ended, pelase log in again"')
					.send("The token has expired, please log in again")
			}
			res.locals.jwtPayload = JWTPayload; 
		} catch (error) {
			return res.status(401)
				// .header('WWW-Authenticate', 'Basic realm="you need to be logged in"')
				.send("an error has happened while authorizing");
		}

		next()
	}
}