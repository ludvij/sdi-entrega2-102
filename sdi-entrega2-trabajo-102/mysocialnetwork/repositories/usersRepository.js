module.exports = {
    userModel: null,
    app: null,
    init: function (app, userModel) {
        this.userModel = userModel;
        this.app = app;
    }, 
	createUser: function (body, securePassword, callback) {
        let user = new this.userModel({
            email: body.email,
            name: body.name,
            surname: body.surname,
            password: securePassword,
            role: "ROLE_USER"
        });
        user.save(callback);
    }, 
	getUsersPg: async function (filter, options, page) {
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
    },
	findUser: async function (filter, callback){		
        return await this.userModel.findOne(filter).exec(callback);
    },
	findUserById: async function(id) {
        const response = await this.userModel.findById(id).exec();
        return response;

    }, 
	deleteUser: async function (emails) {
        try {
            if (typeof emails === 'string') {
                await this.userModel.deleteOne({email: emails}).exec();
            } else if(emails != undefined) {
				// usage of mongoose thing
				await this.userModel.deleteMany({email: {$in: emails}}).exec();
            }
        } catch (error) {
            throw (error);
        }
    }, 
	setFriendship: async function (id, receiver, sender) {
        let index = receiver.requestReceived.indexOf(id);
        receiver.requestReceived.splice(index, 1);
        index = sender.requestSent.indexOf(id);
        sender.requestSent.splice(index, 1);

        receiver.friends.push(sender._id);
        sender.friends.push(receiver._id);

        receiver.save();
        sender.save();
    }, 
	deleteRequests: async function (id, receiver, sender) {
        let index = receiver.requestReceived.indexOf(id);
        receiver.requestReceived.splice(index, 1);
        index = sender.requestSent.indexOf(id);
        sender.requestSent.splice(index, 1);

        receiver.save();
        sender.save();
    }
};