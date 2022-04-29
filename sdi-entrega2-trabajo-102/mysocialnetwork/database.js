const mongoose = require('mongoose')

module.exports.connect = () => {
    // start the database
    // mongodb+srv://admin:<password>@sdibook.1ld9m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
    mongoose.connect(
        "mongodb+srv://admin:admin@sdibook.1ld9m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    ).then((result) => {
        console.log('connected to: ' + result.connection.name)
    }).catch((error) => {
        console.error('Error occurred connecting to database: ' + error)
    })
}


