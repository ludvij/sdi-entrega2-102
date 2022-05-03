module.exports = {
    userModel: null,
    app: null,
    init: function (app, userModel) {
        this.userModel = userModel;
        this.app = app;
    },getUsersPg: async function (filter, options, page) {
        try {
            const limit = 5;
            const usersCollectionCount = await this.userModel.count();
            let result;
            await this.userModel.find(filter, options).skip((page - 1) * limit).limit(limit).then((users) => {
                result = {users: users, total: usersCollectionCount};
            });
            return result;
        } catch (error) {
            throw (error);
        }
    }
};