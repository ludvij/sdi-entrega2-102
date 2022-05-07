module.exports = {
    friendshipRequestModel: null,
    app: null,
    init: function (app, friendshipRequestModel) {
        this.friendshipRequestModel = friendshipRequestModel;
        this.app = app;
    },getFriendshipRequests: async function (filter, options, callback) {
        await this.friendshipRequestModel.find(filter, options).exec(callback);
    },addFriendshipRequest: function (sender, receiver, callback){
        const friendshipReq = new this.friendshipRequestModel({
            sender: sender,
            receiver: receiver
        });
        await friendshipReq.save(callback);
    }
};