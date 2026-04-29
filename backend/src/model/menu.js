const db = require('../config/db'); // Pastikan ini mengarah ke file koneksi db kamu

class Menu {
    // Menampilkan semua data menu
    static getAll() {
        const sql = "SELECT * FROM menu";
        return db.query(sql); // Mengembalikan promise, bukan callback
    }

    // Menampilkan data by id
    static getByID(id) {
        const sql = "SELECT * FROM menu WHERE id_menu = ?";
        return db.query(sql, [id]);
    }

    // Create model data 
    static create(data) {
        const sql = `
        INSERT INTO menu (id_kategori, nama_menu, harga)
        VALUES (?, ?, ?)
        `;
        return db.query(sql, [
            data.id_kategori || null, // Membolehkan null jika kategori belum ada
            data.nama_menu,
            data.harga
        ]);
    }

    // Update model data
    static update(id, data) {
        const sql = `
        UPDATE menu SET id_kategori = ?, nama_menu = ?, harga = ? WHERE id_menu = ?
        `;
        return db.query(sql, [
            data.id_kategori || null,
            data.nama_menu,
            data.harga,
            id
        ]);
    }

    // Delete model data
    static delete(id) {
        const sql = "DELETE FROM menu WHERE id_menu = ?";
        return db.query(sql, [id]);
    }
}

module.exports = Menu;