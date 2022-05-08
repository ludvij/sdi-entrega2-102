module.exports = function(app, usersRepository, postsRepository) {
    app.get("/posts", function(req, res) {
        res.redirect("/posts/listOwn");
    });
    app.get("/posts/add", function(req, res) {
        res.render("posts/add.twig", {user: req.session.user});
    });
    app.post("/posts/add", async function(req, res) {
		try {
			let creatorUser = await usersRepository.findUser({email: req.session.user.email})
			let postPlain = {
				title: req.body.title,
				body: req.body.body,
				owner: creatorUser
			};
			let post = await postsRepository.create(postPlain)
			creatorUser.posts.push(post._id);
			creatorUser.save();
			res.redirect("/posts/listOwn");
		} catch (error) {
			res.status(500).send(error)
		}

    });
    app.get("/posts/listOwn", async (req, res) => {
		try {
			let user = await usersRepository.findUser({email: req.session.user.email})
			let filter = {owner: user._id};
			let options = {};
			let page = parseInt(req.query.page);
			if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
				page = 1;
			}
			// console.log(user)
			let posts = await postsRepository.getPostsPg(filter, options, page)
			// console.log(posts)
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
			res.status(500).send(error)
		}
	});

	app.get("/posts/list/:email", async (req, res) => {
		try {
			let user = await usersRepository.findUser({email: req.params.email})
			let userLoged = await usersRepository.findUser({email: req.session.user.email})
			var friends = false
			userLoged.friends.forEach((u) => {
				if(user != null && u.equals(user._id))
					friends = true;
			})

			if(!friends){
				res.send("No puedes ver las publicaciones de esa persona")
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
			console.log(error)
			res.status(500).send(error)
		}
	});


}