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
    },getFriendshipRequests: async function (filter, options, callback) {
        await this.friendshipRequestModel.find(filter, options).exec(callback);
    },addFriendshipRequest: function (sender, receiver, callback){
        const friendshipReq = new this.friendshipRequestModel({
            sender: sender,
            receiver: receiver
        });
        friendshipReq.save(callback);
    }
};