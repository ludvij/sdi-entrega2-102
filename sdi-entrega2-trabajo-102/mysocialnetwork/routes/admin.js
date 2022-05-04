module.exports = function (app, userModel, usersRepository) {
    app.get('/admin/list', async function (req, res) {
        await userModel.find().exec(function (err, users) {
            if (err)
                console.log(err);
            else
                res.render('admin/list.twig', {users: users});
        });
    });

    app.post('/admin/delete/', async function (req, res) {
        await usersRepository.deleteUser(req.body.users);
        res.redirect("/admin/list");
    })
}