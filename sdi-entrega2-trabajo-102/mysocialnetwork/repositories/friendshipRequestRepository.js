const {FriendShipRequest}= require('../schemas/schema')

module.exports = {
    app: null,
    init: function (app) {
        this.app = app
    }, 
	findFriendshipRequest: async (filter) => {
        return await FriendShipRequest.findOne(filter);
    }, 
	deleteFriendshipRequest: async (id) => {
        return await FriendShipRequest.findByIdAndDelete(id)
    },
	getFriendshipRequests: async (filter, options) => {
        return await FriendShipRequest.find(filter, options);
    },
	addFriendshipRequest: async (sender, receiver, callback) => {
        const friendshipReq = new FriendShipRequest({
            sender: sender,
            receiver: receiver
        });
        return await friendshipReq.save(callback);
    }
};