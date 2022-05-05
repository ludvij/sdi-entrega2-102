module.exports = function (app, userModel) {
    app.get('/admin/list', async function (req, res) {
        await userModel.find().exec(function (err, users) {
            if (err)
                console.log(err);
            else
                res.render('admin/list.twig', {users: users, user: req.session.user});
        });
    });
}