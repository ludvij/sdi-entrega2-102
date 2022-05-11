const {User} = require("../schemas/schema");
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

			console.log(error);
		}
	});

    app.post('/admin/delete/', async (req, res) => {
		let emails = []
		if (typeof req.body.users == 'string') {
			emails.push(req.body.users);
		} else{
			emails = req.body.users;
		}
		for(let i = 0; i < emails.length; i++){
			let user = await usersRepository.findUser({email: emails[i]})
			// remove self from others
			let friends = await User.find({_id: {$in: user.friends}})
			for(let friend of friends) {
				let idx = friend.friends.indexOf(user._id)
				friend.friends.splice(idx, 1)
				await friend.save()
			}

			// delete posts
			await postRepository.deleteMany(user._id);
			// delete requests sent
			await friendshipRequestRepository.deleteManySenders(user._id);
			// delete requests received
			await friendshipRequestRepository.deleteManyReceiver(user._id);
		}
        await usersRepository.deleteUser(req.body.users);
        res.redirect("/admin/list");
    })
}