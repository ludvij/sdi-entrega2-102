module.exports = function(app, postModel) {
    app.get("/posts/add", function(req, res) {
        res.render("posts/add.twig");
    });
    app.post("/posts/add", function(req, res) {
        let post = {};

    });
}