const { InvoiceHeader } = require('../models/InvoiceHeader');
const { InvoiceItems } = require('../models/InvoiceItems');
const { InvoiceBillSundry } = require('../models/InvoiceBillSundry');

console.log(InvoiceHeader, InvoiceItems, InvoiceBillSundry);
const validateInvoice = (invoiceHeader, invoiceItems, invoiceBillSundry) => {
  let totalItemsAmount = 0;
  let totalBillSundryAmount = 0;

  for (let item of invoiceItems) {
    if (item.Quantity <= 0 || item.Price <= 0 || item.Amount <= 0) {
      throw new Error('Quantity, Price, and Amount must be greater than zero.');
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

exports.createInvoice = (req, res) => {
  const { invoiceHeader, invoiceItems, invoiceBillSundry } = req.body;
  const newInvoiceHeader = new InvoiceHeader(invoiceHeader);

  newInvoiceHeader
    .save()
    .then((header) => {
      const invoiceHeaderId = header._id;
      return Promise.all([
        InvoiceItems.insertMany(invoiceItems.map((item) => ({ ...item, invoiceHeaderId }))),
        InvoiceBillSundry.insertMany(invoiceBillSundry.map((bill) => ({ ...bill, invoiceHeaderId }))),
      ]);
    })
    .then(() => res.status(201).json({ message: 'Invoice created successfully' }))
    .catch((err) => res.status(400).json({ error: err.message }));
};

exports.getInvoiceById = (req, res) => {
  const { id } = req.params;
  
  InvoiceHeader.findById(id)
    .then((invoiceHeader) => {
      if (!invoiceHeader) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      return Promise.all([
        InvoiceItems.find({ invoiceHeaderId: id }),
        InvoiceBillSundry.find({ invoiceHeaderId: id }),
      ]).then(([invoiceItems, invoiceBillSundry]) => {
        res.json({ invoiceHeader, invoiceItems, invoiceBillSundry });
      });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.getAllInvoices = (req, res) => {
  InvoiceHeader.find()
    .then((invoices) => res.json(invoices))
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.updateInvoice = (req, res) => {
  const { id } = req.params;
  const { invoiceHeader, invoiceItems, invoiceBillSundry } = req.body;

  validateInvoice(invoiceHeader, invoiceItems, invoiceBillSundry);

  InvoiceHeader.findByIdAndUpdate(id, invoiceHeader)
    .then((invoice) => {
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      return Promise.all([
        InvoiceItems.deleteMany({ invoiceHeaderId: id }),
        InvoiceBillSundry.deleteMany({ invoiceHeaderId: id }),
        InvoiceItems.insertMany(invoiceItems.map((item) => ({ ...item, invoiceHeaderId: id }))),
        InvoiceBillSundry.insertMany(invoiceBillSundry.map((bill) => ({ ...bill, invoiceHeaderId: id }))),
      ]);
    })
    .then(() => res.json({ message: 'Invoice updated successfully' }))
    .catch((err) => res.status(400).json({ error: err.message }));
};

exports.deleteInvoice = (req, res) => {
  const { id } = req.params;

  InvoiceHeader.findByIdAndDelete(id)
    .then((invoice) => {
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      return Promise.all([
        InvoiceItems.deleteMany({ invoiceHeaderId: id }),
        InvoiceBillSundry.deleteMany({ invoiceHeaderId: id }),
      ]);
    })
    .then(() => res.json({ message: 'Invoice deleted successfully' }))
    .catch((err) => res.status(500).json({ error: err.message }));
};
