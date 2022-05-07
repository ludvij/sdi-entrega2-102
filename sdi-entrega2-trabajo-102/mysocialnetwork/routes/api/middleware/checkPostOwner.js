const postRepository = require('../../../repositories/postsRepository')

module.exports.checkPostOwner = (app) => {
	return checker = (req, res, next) => {
		let payload = res.locals.jwtpayload
		if (payload.user.role !== "ROLE_ADMIN") {
			return next()
		}
		let post = await postRepository.findPost(req.params.id, "owner")
		if (post.owner === payload.user._id) {
			return next()
		} else {
			res.status(401).send('No eres propietario de este post')
		}
	}
}