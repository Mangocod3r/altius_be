const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const rinvoice = require('./routes/route.js');

const app = express();

const PORT = 5001;

app.use(bodyParser.json());

app.use('/', rinvoice);

app.get('/', (req, res) => {
    res.send('hello');
})


mongoose.connect(
    'mongodb+srv://user1:tmpinvoice@cluster0.vf0s7dl.mongodb.net/invoice?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Error connecting to MongoDB', err.message));

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));