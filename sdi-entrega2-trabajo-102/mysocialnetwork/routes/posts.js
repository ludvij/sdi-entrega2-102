module.exports = function(app, postModel, userModel) {
    app.get("/posts", function(req, res) {
        res.redirect("/posts/add");
    });
    app.get("/posts/add", function(req, res) {
        res.render("posts/add.twig");
    });
    app.post("/posts/add", async function(req, res) {
        let creatorUser;
        await userModel.findOne({email: req.session.user}).exec(function (err, user) {
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
                res.redirect("/users/list"); // TODO: redirect a post list mejor
            }
        });
    });

}