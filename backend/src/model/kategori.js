const db = require('../config/db');

class Kategori {
    static getAll() {
        return db.query("SELECT * FROM kategori");
    }
}

module.exports = Kategori;