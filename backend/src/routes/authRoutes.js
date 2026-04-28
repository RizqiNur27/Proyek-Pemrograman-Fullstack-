const express = require('express');
const router = express.Router();
const authcontroller = require('../controller/authcontroller');

// Perhatikan: Gunakan .bind(authController) jika kamu menggunakan 'this' di dalam class
router.post('/register', authcontroller.register);
router.post('/login', authcontroller.login);

module.exports = router;