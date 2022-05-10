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
		let num = (page - 1) * limit

		let data = await User.find(filter, options)
			.sort({email:1, name:1})
			.collation({locale:'es', numericOrdering:true})
			.skip(num)
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
	getFriendsPg: async (page, filter, options={}) => {
		const limit = 5;
		let num = (page - 1) * limit
		let {friends} = await User.findOne(filter, options).populate('friends')
		const friendsCollectionCount = friends.length;
		// skip and limit
		friends = friends.slice(num, num + limit)

		return {users: friends, total: friendsCollectionCount};
       
    },
	findAndPopulate: async (filter, options={}) => {
		return await User.findOne(filter, options).populate('friends').populate('posts')
	}
};