const mongoose  = require("mongoose");

const {Schema} = mongoose;

const UserSchema = new Schema({
	email: {type: String, unique: true, required: true},
	password: {type: String, required: true},
	name: {type: String, required: true},
	surname: {type: String, required: true},
	role: {type: String, enum: ["ROLE_ADMIN", "ROLE_USER"], required: true},
	friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
	// requestSent: [{type: Schema.Types.ObjectId, ref:"FriendShipRequest"}],
	// requestReceived: [{type: Schema.Types.ObjectId, ref:"FriendShipRequest"}],
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

const MessageSchema = new Schema({
	sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	receiver: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	text: {type: String, required: true},
	read: {type: Boolean, default: false}
},
	{timestamps: true})

const Post =  mongoose.model('Post', PostSchema)
const FriendShipRequest = mongoose.model('FriendShipRequest', FriendShipRequestSchema)
const Message = mongoose.model('Message', MessageSchema)
const User = mongoose.model('User', UserSchema)




module.exports.User = User
module.exports.Post = Post
module.exports.FriendShipRequest = FriendShipRequest
module.exports.Message = Message