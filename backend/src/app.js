const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware   
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Cek Koneksi Awal
app.get('/', (req, res) => {
    res.send('API Ordering System Running...');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});