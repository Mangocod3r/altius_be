const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;

const invoiceBillSundrySchema = new Schema({
    Id: {
        type: String,
        unique: true
    },
    BillSundryName: String,
    Amount: Number,
    invoiceHeaderId: {
        type: String,
        ref: 'InvoiceHeader'
    }
});

InvoiceBillSundry = model('invoice_billsundry', invoiceBillSundrySchema)
module.exports = InvoiceBillSundry;