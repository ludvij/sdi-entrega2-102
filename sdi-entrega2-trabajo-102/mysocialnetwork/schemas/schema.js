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

const User = mongoose.model('User', UserSchema)
const Post =  mongoose.model('Post', PostSchema)
const FriendShipRequest = mongoose.model('FriendShipRequest', FriendShipRequestSchema)
const Message = mongoose.model('Message', MessageSchema)

// middlewares

// TODO: checkthis works fine, may not work
UserSchema.pre('deleteOne', {document:true, query:true}, async (next) => {
	const id = this._id
	// delete posts
	let posts = await Post.deleteMany({owner: id})
	// remove self from others
	let friends = await User.find({_id: {$in: this.friends}})
	for(let friend of friends) {
		let idx = friend.friends.indexOf(id)
		friend.friends.splice(idx, 1)
		await friend.save()
		console.log('upadted: ' + friend)
	}

	// delete requests sent
	let reqs_send = await FriendShipRequest.deleteMany({sender: id})
	// delete requests received
	let reqs_rec = await FriendShipRequest.deleteMany({receiver: id})

	console.log(posts)
	console.log(reqs)
	next()
})

UserSchema.pre('deleteMany', {document:true, query:true}, async (next) => {
	for (let user of this) {
		const id = user._id
		// remove self from others
		let friends = await User.find({_id: {$in: user.friends}})
		for(let friend of friends) {
			let idx = friend.friends.indexOf(id)
			friend.friends.splice(idx, 1)
			await friend.save()
		}

		// delete posts
		let posts = await Post.deleteMany({owner: id})
		// delete requests sent
		let reqs_send = await FriendShipRequest.deleteMany({sender: id})
		// delete requests received
		let reqs_rec = await FriendShipRequest.deleteMany({receiver: id})

	}
	next()

})

module.exports.User = User
module.exports.Post = Post
module.exports.FriendShipRequest = FriendShipRequest
module.exports.Message = Message