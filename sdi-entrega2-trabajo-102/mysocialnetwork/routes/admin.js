module.exports = function (app, userModel, usersRepository) {
    app.get('/admin/list', async function (req, res) {
        await userModel.find().sort({email: 1}).exec(function (err, users) {
            if (err)
                console.log(err);
            else
                res.render('admin/list.twig', {users: users, user: req.session.user});
        });
    });

    app.post('/admin/delete/', async function (req, res) {
        await usersRepository.deleteUser(req.body.users);
        res.redirect("/admin/list");
    })
}