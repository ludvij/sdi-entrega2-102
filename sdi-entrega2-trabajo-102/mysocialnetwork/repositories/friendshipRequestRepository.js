const {FriendShipRequest}= require('../schemas/schema')

module.exports = {
    app: null,
    init: function (app) {
        this.app = app
    }, 
	findFriendshipRequest: async (filter, options={}) => {
        return await FriendShipRequest.findOne(filter, options);
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