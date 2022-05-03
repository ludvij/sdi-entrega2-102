module.exports = {
    mongoClient: null,
    app: null,
    init: function (app, mongoClient) {
        this.mongoClient = mongoClient;
        this.app = app;
    }, findUser: async function (filter, options) {
        try {
            const client = await this.mongoClient.connect(this.app.get('connectionStrings'));
            const database = client.db("sdibook");
            const collectionName = 'users';
            const usersCollection = database.collection(collectionName);
            const user = await usersCollection.findOne(filter, options);
            return user;
        } catch (error) {
            throw (error);
        }
    }, insertUser: async function (user) {
        try {
            const client = await this.mongoClient.connect(this.app.get('connectionStrings'));
            const database = client.db("sdibook");
            const collectionName = 'users';
            const usersCollection = database.collection(collectionName);
            const result = await usersCollection.insertOne(user);
            return result.insertedId;
        } catch (error) {
            throw (error);
        }
    }, deleteUser: async function (emails) {
        try{
            const client = await this.mongoClient.connect(this.app.get('connectionStrings'));
            const database = client.db('sdibook');
            const collectionName = 'users';
            const usersCollection = database.collection(collectionName);
            var deletedCount = 0;
            var result;
            for (const email of emails.users) {
                result = await usersCollection.deleteOne({email: email})
                deletedCount += result.deletedCount;
            }
            if (emails.users.length == deletedCount) {
                console.log("Successfully deleted the user(s).");
            } else {
                console.log("There was an error deleting de user(s)");
            }
        } catch (error){
            throw (error);
        }
    }
};