const Transaksi = require("../model/transaksi");
const errorHandler = require("../utils/errorhandler");

class TransaksiController {
    async bayar(req, res) {
        try {
            const { id_order, metode_pembayaran } = req.body;

            // Validasi data tidak boleh kosong
            if (!id_order || !metode_pembayaran) {
                return errorHandler(res, "ID Order dan metode pembayaran wajib diisi", 400, "Bad Request");
            }

            // Panggil fungsi pembayaran dari model
            const result = await Transaksi.prosesPembayaran(id_order, metode_pembayaran);

            res.status(201).json({
                success: true,
                message: "Pembayaran berhasil diproses, pesanan selesai!",
                data: result
            });

        } catch (err) {
            // Kita gunakan status 400 agar Postman menampilkan pesan error spesifik jika pesanan sudah dibayar
            return errorHandler(res, err, 400, err.message || "Gagal memproses pembayaran");
        }
    }
}

module.exports = new TransaksiController();