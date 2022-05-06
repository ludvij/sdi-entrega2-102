module.exports = {
    friendshipRequestModel: null,
    app: null,
    init: function (app, friendshipRequestModel) {
        this.friendshipRequestModel = friendshipRequestModel;
        this.app = app;
    }, findFriendshipRequest: async function (filter){
        const request = await this.friendshipRequestModel.findOne(filter).exec();
        return request
    }, deleteFriendshipRequest: async function (id) {
        const request = await this.friendshipRequestModel.deleteOne({_id: id}).exec();
        return request;
    }
};