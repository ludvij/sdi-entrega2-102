const mongoose = require('mongoose')

const userSchema = new Schema (
    {
        webId: {type: String, required: true},
        address: {type: String, required: true},
        name: {type: String, required: false },
        shippingPrice: {type: Number, required: true},
        totalPrice: {type: Number, required: true},
        products: [{
            product: String,
            amount: Number
        }]
    }, {
        timestamps: true
    }
);


export default mongoose.model<IOrder>("Order", orderSchema);
