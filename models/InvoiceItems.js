const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;

const invoiceItemsSchema = new Schema({
    Id: {
        type: String,
        unique: true
    },
    ItemName: String,
    Quantity: {
        type: Number,
        min: 1
    },
    Price: {
        type: Number,
        min: 1
    },
    Amount: {
        type: Number,
        min: 1
    },
    invoiceHeaderId: {
        type: String,
        ref: 'InvoiceHeader'
    }
});

const InvoiceItems = model('InvoiceItems', invoiceItemsSchema)
module.exports = {InvoiceItems};