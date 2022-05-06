module.exports = function(app, postModel, userModel, postsRepository) {
    app.get("/posts", function(req, res) {
        res.redirect("/posts/listOwn");
    });
    app.get("/posts/add", function(req, res) {
        res.render("posts/add.twig", {user: req.session.user});
    });
    app.post("/posts/add", async function(req, res) {
        let creatorUser;
        await userModel.findOne({email: req.session.user.email}).exec(function (err, user) {
            if (err) {
                console.log(err);
            } else {
                creatorUser = user;
                let postPlain = {
                    title: req.body.title,
                    body: req.body.body,
                    owner: creatorUser
                };
                new postModel(postPlain).save();
                res.redirect("/posts/listOwn");
            }
        });
    });
    app.get("/posts/listOwn", async function(req, res) {
        let userEmail = req.session.user;
        await userModel.findOne({email: req.session.user.email}).exec(async function (err, user) {
            if (err) {
                console.log(err);
            } else {
                let filter = {owner: user};
                let options = {};
                let page = parseInt(req.query.page);
                if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
                    page = 1;
                }

                postsRepository.getPostsPg(filter, options, page).then(result => {
                    let lastPage = result.total / 5;
                    if (result.total % 5 > 0)
                        lastPage = lastPage + 1;
                    let pages = [];
                    for (let i = page - 2; i <= page + 2; i++) {
                        if (i > 0 && i <= lastPage) {
                            pages.push(i);
                        }
                    }
                    let response = {
                        posts: result.posts,
                        pages: pages,
                        currentPage: page,
                        search: req.query.search,
                        user: req.session.user
                    }
                    res.render("posts/listOwn.twig", response);
                }).catch(err => {
                    res.send("Error al recuperar posts. " + err)
                });
            }
        });
    })

}