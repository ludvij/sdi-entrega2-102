const session = require('express-session');
const logger = require('../logger')

module.exports = function(app, usersRepository, postsRepository) {
    app.get("/posts", function(req, res) {
        res.redirect("/posts/listOwn");
    });
    app.get("/posts/add", function(req, res) {
        res.render("posts/add.twig", {user: req.session.user});
    });
    app.post("/posts/add", async function(req, res) {
		try {
			
			let postPlain = {
				title: req.body.title,
				body: req.body.body,
				owner: req.session.user._id
			};
			let post = await postsRepository.create(postPlain)
			
			// LOGS
			logger.info(`${req.session.user.email} has created a new post: [${post._id}]`)
			// !LOGS
			res.redirect("/posts/listOwn");
		} catch (error) {
			logger.error(error)
			res.status(500).send(error)
		}

    });
    app.get("/posts/listOwn", async (req, res) => {
		try {
			let filter = {owner: req.session.user._id};
			let options = {};
			let page = parseInt(req.query.page);
			if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
				page = 1;
			}
			let posts = await postsRepository.getPostsPg(filter, options, page)
			let lastPage = posts.total / 5;
			if (posts.total % 5 > 0)
				lastPage = lastPage + 1;
			let pages = [];
			for (let i = page - 2; i <= page + 2; i++) {
				if (i > 0 && i <= lastPage) {
					pages.push(i);
				}
			}
			let response = {
				posts: posts.data,
				pages: pages,
				currentPage: page,
				search: req.query.search,
				user: req.session.user
			}
			res.render("posts/listOwn.twig", response);
		} catch(error) {
			logger.error(error)
			res.status(500).send(error)
		}
	});

	app.get("/posts/list/:email", async (req, res) => {
		try {
			let user = await usersRepository.findUser({email: req.params.email}, "_id")
			let userLoged = await usersRepository.findUser({email: req.session.user.email}, "friends")
			var friends = false
			userLoged.friends.forEach((u) => {
				if(user != null && u.equals(user._id))
					friends = true;
			})

			if(!friends){
				res.status(403)
				res.render("error.twig", {message: "No puedes ver las publicaciones de esa persona", user: req.session.user})
			}else {
				let filter = {owner: user._id};
				let options = {};
				let page = parseInt(req.query.page);
				if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
					page = 1;
				}

				let posts = await postsRepository.getPostsPg(filter, options, page)

				let lastPage = posts.total / 5;
				if (posts.total % 5 > 0)
					lastPage = lastPage + 1;
				let pages = [];
				for (let i = page - 2; i <= page + 2; i++) {
					if (i > 0 && i <= lastPage) {
						pages.push(i);
					}
				}
				let response = {
					posts: posts.data,
					pages: pages,
					currentPage: page,
					search: req.query.search,
					user: req.session.user
				}
				res.render("posts/list.twig", response);
			}
		} catch(error) {
			logger.error(error)
			res.status(500)
			res.render("error.twig", {message: "Se ha producido un error", user: req.session.user, error: error})
		}
	});


}