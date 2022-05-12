const {Post, User} = require('../schemas/schema');



module.exports = {
    app: null,
    init: function (app) {
        this.app = app;
    }, 
	findPost: async (id, options={}) => {
		return await Post.findById(id, options)
	},
	getPostsPg: async (filter, options, page) => {
		const limit = 5;
		const postsCollectionCount = await Post.count(filter);
		let data = await Post.find(filter, options).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit)
		
		return {data: data, total: postsCollectionCount};
    },
	create: async (body) => {
		let post = new Post(body)
		let user = await User.findById(post.owner)
		user.posts.push(post._id)
		post = await post.save()
		await user.save() 
		return post

	},
	deleteMany: async (ownerId) => {
		await Post.deleteMany({owner: ownerId})
	}
};