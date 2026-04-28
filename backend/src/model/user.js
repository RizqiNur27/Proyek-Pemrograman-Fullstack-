const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class User {
    static findByEmail(email, callback) {
        const query = 'SELECT * FROM users WHERE email = $1';
        pool.query(query, [email], (err, res) => {
            if (err) return callback(err, null);
            callback(null, res.rows);
        });
    }

    static create(data, callback) {
        const query = 'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)';
        pool.query(query, [data.email, data.password, data.role], (err, res) => {
            if (err) return callback(err);
            callback(null);
        });
    }
}

module.exports = User;