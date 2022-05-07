const {Message, FriendShipRequest, User} = require('../schemas/schema')

module.exports = {
    app: null,
    init: function (app) {
        this.app = app
    },
    createMessage: async (body) => {
        let user = new Message({
            sender: body.sender,
            receiver: body.receiver,
            text: body.text,
            read: body.read
        });
        return await user.save();
    }
};