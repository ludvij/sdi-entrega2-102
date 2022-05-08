const {Message} = require('../schemas/schema')

module.exports = {
    app: null,
    init: function (app) {
        this.app = app
    },
    findConversation: async (filter) => {
        return await Message.find(filter)
    }
};
