module.exports = function(app, postModel, usersRepository) {
    app.get("/posts/add", function(req, res) {
        res.render("posts/add.twig");
    });
    app.post("/posts/add", function(req, res) {
        let post = {};

    })
}