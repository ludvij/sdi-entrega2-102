const {Message} = require('../schemas/schema')

module.exports = {
    app: null,
    init: function (app) {
        this.app = app
    },
    findConversation: async (filter) => {
        return await Message.find(filter)
    },
    createMessage: async (body) => {
        let message = new Message(body);
        return await message.save();
    },
    findMessage: async (filter) => {
      return await Message.findOne(filter);
    },
    readMessage: async (body) => {
        await Message.updateOne({_id: body._id}, {read: true});
    }
};