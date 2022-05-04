module.exports = {
    userModel: null,
    app: null,
    init: function (app, userModel) {
        this.userModel = userModel;
        this.app = app;
    }, createUser: function (body, securePassword, callback) {
        let user = new this.userModel({
            email: body.email,
            name: body.name,
            surname: body.surname,
            password: securePassword,
            role: "ROLE_USER"
        });
        user.save(callback);
    }, getUsersPg: async function (filter, options, page) {
        try {
            const limit = 5;
            const usersCollectionCount = await this.userModel.count(filter);
            let result;
            await this.userModel.find(filter, options).skip((page - 1) * limit).limit(limit).then((users) => {
                result = {users: users, total: usersCollectionCount};
            });
            return result;
        } catch (error) {
            throw (error);
        }
    }, findUser: async function (filter, callback) {
        await this.userModel.findOne(filter).exec(callback);
    }, deleteUser: async function (emails) {
        try {
            if (typeof emails === 'string') {
                console.log("string")
                await this.userModel.deleteOne({email: emails}).exec();
            } else {
                console.log("array")
                for (let i = 0; i < emails.length; i++) {
                    let email = emails[i]
                    await this.userModel.deleteOne({email: email}).exec();
                }
            }
        } catch (error) {
            throw (error);
        }
    }
};