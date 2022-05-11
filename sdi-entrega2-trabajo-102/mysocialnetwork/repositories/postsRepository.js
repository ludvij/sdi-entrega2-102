const {Post} = require('../schemas/schema')


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
		let result;
		let data = await Post.find(filter, options).skip((page - 1) * limit).limit(limit)
		
		return {data: data, total: postsCollectionCount};
    },
	create: async (body) => {
		let post = new Post(body)
		return await post.save()
	},
	deleteMany: async (ownerId) => {
		await Post.deleteMany({owner: ownerId})
	}
};