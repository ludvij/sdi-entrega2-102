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
        console.log(req.body)
        for(let email of req.body.users){
            userModel.deleteOne({email: email}).exec(function (err) {
                if(err)
                    console.log(err)
                else
                    console.log("ok")
            })
        }
        await userModel.find().exec(function (err, users) {
            if (err)
                console.log(err);
            else
                res.render('admin/list.twig', {users: users});
        });
    })
}