const {Message} = require('../schemas/schema')

module.exports = {
    app: null,
    init: function (app) {
        this.app = app
    },
    createMessage: async (body) => {
        let message = new Message(body);
        return await message.save();
    }
};