const Transaksi = require("../model/transaksi");
const errorHandler = require("../utils/errorhandler");

class TransaksiController {
    async bayar(req, res) {
        try {
            const { id_order, metode_pembayaran } = req.body;

            if (!id_order || !metode_pembayaran) {
                return errorHandler(res, "ID Order dan metode pembayaran wajib diisi", 400, "Bad Request");
            }

            const result = await Transaksi.prosesPembayaran(id_order, metode_pembayaran);

            let message = "Pembayaran berhasil diproses!";
            if (metode_pembayaran !== 'cash') {
                message = "Pesanan dibuat! Silakan tunjukkan QRIS ke kasir.";
            }

            res.status(201).json({
                success: true,
                message,
                data: result
            });

        } catch (err) {
            return errorHandler(res, err, 400, err.message || "Gagal memproses pembayaran");
        }
    }

    async index(req, res) {
        try {
            const daftarTransaksi = await Transaksi.getAll();
            res.status(200).json({
                success: true,
                data: daftarTransaksi
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message || "Gagal mengambil riwayat transaksi"
            });
        }
    }

    async lunas(req, res) {
        try {
            const { id } = req.params;
            const result = await Transaksi.setLunas(id);
            res.json({ success: true, message: "Status pembayaran diubah menjadi LUNAS", data: result });
        } catch (err) {
            return errorHandler(res, err, 400, err.message || "Gagal mengupdate status");
        }
    }

}

module.exports = new TransaksiController();
