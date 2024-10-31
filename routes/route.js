// routes/invoices.js
const express = require('express');
const router = express.Router();

const {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
  getInvoiceById, 
  getAllInvoices   
} = require('../controllers/invoiceController');

// POST route to create a new invoice
router.post('/test/invoices', createInvoice);

// GET route to retrieve all invoices
router.get('/test/invoices', getAllInvoices);

// GET route to retrieve a specific invoice by ID
router.get('/test/invoices/:id', getInvoiceById);

// PUT route to update an invoice
router.put('/test/invoices/:id', updateInvoice);

// DELETE route to delete an invoice
router.delete('/test/invoices/:id', deleteInvoice);

module.exports = router;
