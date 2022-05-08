const {User} = require('../schemas/schema')

module.exports = {
    app: null,
    init: function (app) {
        this.app = app;
    }, 
	createUser: async (body, securePassword) => {
        let user = new User({
            email: body.email,
            name: body.name,
            surname: body.surname,
            password: securePassword,
            role: "ROLE_USER"
        });
        return await user.save();
    }, 
	getUsersPg: async (filter, options, page) => {
		const limit = 5;
		const usersCollectionCount = await User.count(filter);

		let data = await User.find(filter, options)
			.skip((page - 1) * limit)
			.limit(limit)

		return {users: data, total: usersCollectionCount};
    },
	findUsers: async (filter, options={}) => {
		return await User.find(filter, options)
	},
	findUser: async (filter, options={}) => {
        return await User.findOne(filter, options);
    },
	findUserById: async function(id, options={}) {
        return await User.findById(id, options);
    },
	deleteUser: async (emails) => {
		if (typeof emails == 'string') {
			await User.deleteOne({email: emails});
		} else if(emails != undefined) {
			// usage of mongoose thing
			await User.deleteMany({email: {$in: emails}});
		}
    }, 
	setFriendship: async (receiver, sender) => {

        receiver.friends.push(sender._id);
        sender.friends.push(receiver._id);

    	await receiver.save();
        await sender.save();
    },
	getFriendsPg: async (page, user) => {
		const limit = 5;
		const friendsCollectionCount = user.friends.length;
		let {friends} = await User.findById(user._id).populate('friends').skip((page - 1) * limit).limit(limit)

		return {users: friends, total: friendsCollectionCount};
       
    },
	findAndPopulate: async (filter, options={}) => {
		return await User.findOne(filter, options).populate('friends').populate('posts')
	}
};