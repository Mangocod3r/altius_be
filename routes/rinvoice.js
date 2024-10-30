
const express = require('express');
const {InvoiceHeader} = require('../models/InvoiceHeader');
const { models } = require('mongoose');
const router = express.Router();

const validateInvoice = (invoiceHeader, invoiceItems, invoiceBillSundry) => {
    let totalItemsAmount = 0;
    let totalBillSundryAmount = 0;

    for (let item of invoiceItems) {
        if (item.Quantity <= 0 || item.Price <= 0 || item.Amount <= 0) {
            throw new Error('Quantity, Price and Amount must be greater than zero.');
        }
        if (item.Amount !== item.Quantity * item.Price) {
            throw new Error('Amount must be equal to Quantity x Price.');
        }
        totalItemsAmount += item.Amount;
    }

    for (let bill of invoiceBillSundry) {
        totalBillSundryAmount += bill.Amount; // Amount can be negative or positive
    }

    const calculatedTotalAmount = totalItemsAmount + totalBillSundryAmount;
    if (invoiceHeader.TotalAmount !== calculatedTotalAmount) {
        throw new Error('TotalAmount must be equal to the sum of InvoiceItems and InvoiceBillSundry amounts.');
    }
};

router.post('/invoices', async (req, res) => {
    try {
        const { invoiceHeader, invoiceItems, invoiceBillSundry } = req.body;
        validateInvoice(invoiceHeader, invoiceItems, invoiceBillSundry);

        const newInvoiceHeader = InvoiceHeader(invoiceHeader);
        await newInvoiceHeader.save();

        await InvoiceItems.insertMany(invoiceItems.map(item => ({ ...item, invoiceHeaderId: newInvoiceHeader._id })));
        await InvoiceBillSundry.insertMany(invoiceBillSundry.map(bill => ({ ...bill, invoiceHeaderId: newInvoiceHeader._id })));

        res.status(201).json({ message: 'Invoice created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const invoiceHeader = await InvoiceHeader.findById(id);
        if (!invoiceHeader) return res.status(404).json({ message: 'Invoice not found' });

        const invoiceItems = await InvoiceItems.find({ invoiceHeaderId: id });
        const invoiceBillSundry = await InvoiceBillSundry.find({ invoiceHeaderId: id });

        res.json({ invoiceHeader, invoiceItems, invoiceBillSundry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/invoices', async (req, res) => {
    try {
        const invoices = await InvoiceHeader.find();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { invoiceHeader, invoiceItems, invoiceBillSundry } = req.body;
        validateInvoice(invoiceHeader, invoiceItems, invoiceBillSundry);

        await InvoiceItems.deleteMany({ invoiceHeaderId: id });
        await InvoiceBillSundry.deleteMany({ invoiceHeaderId: id });

        await InvoiceItems.insertMany(invoiceItems.map(item => ({ ...item, invoiceHeaderId: id })));
        await InvoiceBillSundry.insertMany(invoiceBillSundry.map(bill => ({ ...bill, invoiceHeaderId: id })));
        await InvoiceHeader.findByIdAndUpdate(id, invoiceHeader);

        res.json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await InvoiceHeader.findByIdAndDelete(id);
        await InvoiceItems.deleteMany({ invoiceHeaderId: id });
        await InvoiceBillSundry.deleteMany({ invoiceHeaderId: id });

        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;






/*
{
    "invoiceHeader": {
        "Id": "INV123",
        "Date": "2023-10-14",
        "InvoiceNumber": 1001,
        "CustomerName": "John Doe",
        "BillingAddress": "123 Billing St, City, Country",
        "ShippingAddress": "456 Shipping Rd, City, Country",
        "GSTIN": "GST123456",
        "TotalAmount": 1900
    },
    "invoiceItems": [
        {
            "Id": "ITEM1",
            "ItemName": "Product 1",
            "Quantity": 2,
            "Price": 500,
            "Amount": 1000
        },
        {
            "Id": "ITEM2",
            "ItemName": "Product 2",
            "Quantity": 1,
            "Price": 1000,
            "Amount": 1000
        }
    ],
    "invoiceBillSundry": [
        {
            "Id": "BS1",
            "BillSundryName": "Discount",
            "Amount": -100
        }
    ]
}
{
  "error": "InvoiceHeader is not a constructor"
}
for above data
*/




/*
const mongoose = require('mongoose');
const { Schema } = mongoose;

const invoiceHeaderSchema = new Schema({
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

const InvoiceHeader = mongoose.model('InvoiceHeader', invoiceHeaderSchema);
const InvoiceItems = mongoose.model('InvoiceItems', invoiceItemsSchema);
const InvoiceBillSundry = mongoose.model('InvoiceBillSundry', invoiceBillSundrySchema);

const router = require('express').Router();

router.post('/invoices', async (req, res) => {
    const { invoiceHeader, invoiceItems, invoiceBillSundry } = req.body;

    const newInvoiceHeader = new InvoiceHeader(invoiceHeader);
    await newInvoiceHeader.save();

    await InvoiceItems.insertMany(invoiceItems.map(item => ({ ...item, invoiceHeaderId: newInvoiceHeader._id })));
    await InvoiceBillSundry.insertMany(invoiceBillSundry.map(bill => ({ ...bill, invoiceHeaderId: newInvoiceHeader._id })));

    res.status(201).json({ message: 'Invoice created successfully' });
});

router.put('/invoices/:id', async (req, res) => {
    const { id } = req.params;
    const { invoiceHeader, invoiceItems, invoiceBillSundry } = req.body;

    const invoice = await InvoiceHeader.findById(id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.Date = invoiceHeader.Date;
    invoice.CustomerName = invoiceHeader.CustomerName;
    invoice.BillingAddress = invoiceHeader.BillingAddress;
    invoice.ShippingAddress = invoiceHeader.ShippingAddress;
    invoice.GSTIN = invoiceHeader.GSTIN;
    invoice.TotalAmount = invoiceHeader.TotalAmount;

    await invoice.save();

    await InvoiceItems.deleteMany({ invoiceHeaderId: id });
    await InvoiceItems.insertMany(invoiceItems.map(item => ({ ...item, invoiceHeaderId: id })));

    await InvoiceBillSundry.deleteMany({ invoiceHeaderId: id });
    await InvoiceBillSundry.insertMany(invoiceBillSundry.map(bill => ({ ...bill, invoiceHeaderId: id })));

    res.json({ message: 'Invoice updated successfully' });
});

router.delete('/invoices/:id', async (req, res) => {
    const { id } = req.params;

    await InvoiceHeader.findByIdAndDelete(id);
    await InvoiceItems.deleteMany({ invoiceHeaderId: id });
    await InvoiceBillSundry.deleteMany({ invoiceHeaderId: id });

    res.json({ message: 'Invoice deleted successfully' });
});

router.get('/invoices', async (req, res) => {
    const invoices = await InvoiceHeader.find().populate('invoiceItems invoiceBillSundry');
    res.json(invoices);
});

router.get('/invoices/:id', async (req, res) => {
    const { id } = req.params;
    const invoice = await InvoiceHeader.findById(id).populate('invoiceItems invoiceBillSundry');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    res.json(invoice);
});

module.exports = router;
*/