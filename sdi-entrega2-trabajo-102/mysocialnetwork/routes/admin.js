module.exports = (app, usersRepository) => {

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

			console.log(error);
		}
	});

    app.post('/admin/delete/', async (req, res) => {
        await usersRepository.deleteUser(req.body.users);
        res.redirect("/admin/list");
    })
}