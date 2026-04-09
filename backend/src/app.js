const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cek Koneksi Awal
app.get('/', (req, res) => {
    res.send('API Ordering System Running...');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});