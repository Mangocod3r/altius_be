const mongoose = require('mongoose');

const invoiceHeaderSchema = new mongoose.Schema({
    Id: {
        type: String,
        unique: true
    },
    Date: String,
    InvoiceNumber: {
        type: Number,
        autoIncrement: true,
        unique: true
    },
    CustomerName: String,
    BillingAddress: String,
    ShippingAddress: String,
    GSTIN: String,
    TotalAmount: Number
});
const InvoiceHeader = mongoose.model('InvoiceHeader', invoiceHeaderSchema);

module.exports = {InvoiceHeader};
