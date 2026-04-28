const db = require('../config/db'); // Sesuaikan path ke file db.js kamu

class User {
    static async findByEmail(email) {
        try {
            // MySQL menggunakan '?' bukan '$1'
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async create(data) {
        try {
            const query = 'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(query, [data.nama || 'User', data.email, data.password, data.role || 'pelanggan']);
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = User;