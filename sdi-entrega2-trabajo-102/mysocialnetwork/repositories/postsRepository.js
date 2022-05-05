module.exports = {
    postModel: null,
    app: null,
    init: function (app, postModel) {
        this.postModel = postModel;
        this.app = app;
    }, getPostsPg: async function (filter, options, page) {
        try {
            const limit = 5;
            const postsCollectionCount = await this.postModel.count(filter);
            let result;
            await this.postModel.find(filter, options).skip((page - 1) * limit).limit(limit).then((posts) => {
                result = {posts: posts, total: postsCollectionCount};
            });
            return result;
        } catch (error) {
            throw (error);
        }
    }
};