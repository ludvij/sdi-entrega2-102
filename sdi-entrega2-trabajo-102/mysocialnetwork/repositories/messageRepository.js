const {Message, FriendShipRequest} = require('../schemas/schema')

module.exports = {
    app: null,
    init: function (app) {
        this.app = app
    }
};
