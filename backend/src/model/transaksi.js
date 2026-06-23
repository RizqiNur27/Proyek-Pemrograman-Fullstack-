const db = require('../config/db');

class Transaksi {

    static async getAll() {
        const [rows] = await db.query(`
            SELECT t.id_transaksi, t.id_order, t.metode_pembayaran, t.status_pembayaran, t.waktu_bayar,
                   o.kode_order, o.nama_pemesan, o.tipe_layanan,
                   CAST(COALESCE((SELECT SUM(subtotal) FROM order_detail od WHERE od.id_order = t.id_order), 0) AS SIGNED) AS total_harga
            FROM transaksi t
            JOIN orders o ON t.id_order = o.id_order
            ORDER BY t.waktu_bayar DESC
        `);

        for (const row of rows) {
            const [details] = await db.query(`
                SELECT od.*, m.nama_menu
                FROM order_detail od
                JOIN menu m ON od.id_menu = m.id_menu
                WHERE od.id_order = ?
            `, [row.id_order]);
            row.items = details;
        }
        return rows;
    }

    static async prosesPembayaran(id_order, metode_pembayaran) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [orderRows] = await connection.query('SELECT status FROM orders WHERE id_order = ?', [id_order]);
            if (orderRows.length === 0) {
                throw new Error('Pesanan tidak ditemukan');
            }
            if (orderRows[0].status !== 'pending') {
                throw new Error('Pesanan ini sudah dibayar atau dibatalkan');
            }

            const [detailRows] = await connection.query('SELECT SUM(subtotal) as total FROM order_detail WHERE id_order = ?', [id_order]);
            const total_harga = detailRows[0].total || 0;

            if (total_harga === 0) {
                throw new Error('Rincian pesanan kosong, tidak bisa diproses');
            }

            // Cash → langsung lunas & selesai
            // QRIS → status_pembayaran = 'belum', status order tetap 'pending'
            const isLangsungLunas = metode_pembayaran === 'cash';
            const statusPembayaran = isLangsungLunas ? 'lunas' : 'belum';

            const queryTransaksi = `INSERT INTO transaksi (id_order, total_harga, metode_pembayaran, status_pembayaran) VALUES (?, ?, ?, ?)`;
            const [transaksiResult] = await connection.query(queryTransaksi, [id_order, total_harga, metode_pembayaran, statusPembayaran]);

            if (isLangsungLunas) {
                await connection.query("UPDATE orders SET status = 'selesai' WHERE id_order = ?", [id_order]);
            }

            await connection.commit();
            return {
                id_transaksi: transaksiResult.insertId,
                id_order: id_order,
                total_harga: total_harga,
                metode_pembayaran: metode_pembayaran,
                status_pembayaran: statusPembayaran
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async setLunas(id_transaksi) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [rows] = await connection.query('SELECT id_order FROM transaksi WHERE id_transaksi = ?', [id_transaksi]);
            if (rows.length === 0) throw new Error('Transaksi tidak ditemukan');

            const id_order = rows[0].id_order;

            await connection.query("UPDATE transaksi SET status_pembayaran = 'lunas' WHERE id_transaksi = ?", [id_transaksi]);
            await connection.query("UPDATE orders SET status = 'selesai' WHERE id_order = ?", [id_order]);

            await connection.commit();
            return { id_transaksi, id_order };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

}

module.exports = Transaksi;
