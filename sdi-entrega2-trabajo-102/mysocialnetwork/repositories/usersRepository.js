const {User, Post, FriendShipRequest} = require('../schemas/schema')

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
	deleteUser: async (email) => {
		let user = await User.findOne({email: email})
		if(user == null)
			return;
		// delete posts
		await Post.deleteMany({_id: {$in: user.posts}})
		// delete requests
		await FriendShipRequest.deleteMany({$or: [
				{sender: user._id}, 
				{receiver: user._id}
			]}
		)
		// remove from friends
		let friends = await User.find({_id: {$in: user.friends}})
		for(let friend of friends) {
			let idx = friend.friends.indexOf(user._id)
			friend.friends.splice(idx, 1)
			await friend.save()
		}
		await user.deleteOne({email: email});
    }, 
	deleteUsers: async (emails) => {
		for (let email of emails) {
			let user = await User.findOne({email: email})
			if(user == null)
				continue;
			// delete posts
			await Post.deleteMany({_id: {$in: user.posts}})
			// delete requests
			await FriendShipRequest.deleteMany({$or: [
				{sender: user._id}, 
				{receiver: user._id}
			]}
			)
			// remove from friends
			let friends = await User.find({_id: {$in: user.friends}})
			for(let friend of friends) {
				let idx = friend.friends.indexOf(user._id)
				friend.friends.splice(idx, 1)
				await friend.save()
			}
			await user.deleteOne({email: email})
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