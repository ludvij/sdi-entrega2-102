const logger = require('../logger')

module.exports = (app, usersRepository, postRepository, friendshipRequestRepository) => {

    app.get('/admin/list', async (req, res) => {
		try {
			let users = await usersRepository.findUsers({})
			users.sort((a,b) => {
				return a.email.localeCompare(b.email, undefined, {
					numeric: true,
					sensitivity: 'base'
				})
			})
			res.render('admin/list.twig', {users: users, user: req.session.user});
		} catch (error) {

			logger.error(error);
		}
	});

    app.post('/admin/delete/', async (req, res) => {
		let emails = []
		if (typeof req.body.users == 'string') {
			usersRepository.deleteUser(req.body.users)
		} else{
			usersRepository.deleteUsers(req.body.users)
		}
        res.redirect("/admin/list");
    })
}