const mongoose  = require("mongoose");

const {Schema} = mongoose;

const UserSchema = new Schema({
	email: {type: String, unique: true, required: true},
	password: {type: String, required: true},
	name: {type: String, required: true},
	surname: {type: String, required: true},
	role: {type: String, enum: ["ROLE_ADMIN", "ROLE_USER"], required: true},
	friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
	posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
})


const PostSchema = new Schema({
	title: {type: String, required: true},
	body: {type: String, required: true},
	owner: {type: Schema.Types.ObjectId, ref: 'User', required: true}
},
{
	timestamps: true,

})

const FriendShipRequestSchema = new Schema({
	sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	receiver: {type: Schema.Types.ObjectId, ref: 'User', required: true},
})


module.exports.User = mongoose.model('User', UserSchema)
module.exports.Post = mongoose.model('Post', PostSchema)
module.exports.FriendShipRequest = mongoose.model('FriendShipRequest', FriendShipRequestSchema)
