const Order = require("../model/order");
const db = require('../config/db');
const PDFDocument = require('pdfkit');
const errorHandler = require("../utils/errorhandler");

class OrderController {
    async create(req, res) {
        try {
            const id_user = req.user ? req.user.id : null;
            const { tipe_layanan, items, nama_pemesan } = req.body;

            if (!items || items.length === 0) {
                return errorHandler(res, "Keranjang belanja kosong", 400, "Bad Request");
            }

            const result = await Order.createOrder(id_user, tipe_layanan, items, nama_pemesan);

            res.status(201).json({
                success: true,
                message: "Pesanan berhasil dibuat, silakan menuju kasir",
                data: {
                    id_order: result.id_order,
                    kode_order: result.kode_order,
                    total_tagihan: result.total_harga
                }
            });

        } catch (err) {
            return errorHandler(res, err, 500, err.message || "Gagal membuat pesanan");
        }
    }

    async index(req, res) {
        try {
            const orders = await Order.getAll(); 
            
            res.status(200).json({
                success: true,
                data: orders
            });
        } catch (err) {
            return errorHandler(res, err, 500, err.message || "Gagal mengambil daftar pesanan");
        }
    }

    async struk(req, res) {
        try {
            const { id } = req.params;

            const [orderRows] = await db.query(`
                SELECT o.*, u.nama AS nama_user
                FROM orders o
                LEFT JOIN users u ON o.id_user = u.id_user
                WHERE o.id_order = ?
            `, [id]);
            if (orderRows.length === 0) {
                return errorHandler(res, 'Pesanan tidak ditemukan', 404, 'Not Found');
            }

            const order = orderRows[0];

            const [detailRows] = await db.query(`
                SELECT od.*, m.nama_menu
                FROM order_detail od
                JOIN menu m ON od.id_menu = m.id_menu
                WHERE od.id_order = ?
            `, [id]);

            const nama = order.nama_pemesan || order.nama_user || '(Tanpa Nama)';

            const doc = new PDFDocument({ margin: 30 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="struk-${order.kode_order}.pdf"`);
            doc.pipe(res);

            doc.fontSize(16).font('Helvetica-Bold').text('Warkop Si Bontot', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Struk Pesanan', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(9).text(`Kode: ${order.kode_order}`, { align: 'center' });
            doc.text(`Pelanggan: ${nama}`, { align: 'center' });
            doc.text(`Layanan: ${order.tipe_layanan === 'dine_in' ? 'Makan di Sini' : 'Bawa Pulang'}`, { align: 'center' });
            doc.moveDown();

            const startX = 30;
            let y = doc.y;
            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('Menu', startX, y, { width: 180 });
            doc.text('Qty', startX + 180, y, { width: 40, align: 'center' });
            doc.text('Subtotal', startX + 230, y, { width: 100, align: 'right' });
            doc.moveDown(0.3);
            y = doc.y;
            doc.moveTo(startX, y).lineTo(startX + 330, y).stroke();
            doc.moveDown(0.3);

            let total = 0;
            detailRows.forEach((item) => {
                y = doc.y;
                doc.font('Helvetica').fontSize(8);
                doc.text(item.nama_menu, startX, y, { width: 180 });
                doc.text(String(item.jumlah), startX + 180, y, { width: 40, align: 'center' });
                doc.text(`Rp ${Number(item.subtotal).toLocaleString('id-ID')}`, startX + 230, y, { width: 100, align: 'right' });
                total += item.subtotal;
                doc.moveDown(0.6);
            });

            doc.moveDown(0.3);
            y = doc.y;
            doc.moveTo(startX, y).lineTo(startX + 330, y).stroke();
            doc.moveDown(0.3);

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`Total: Rp ${Number(total).toLocaleString('id-ID')}`, { align: 'right' });

            doc.moveDown(1);
            doc.fontSize(8).font('Helvetica');
            doc.text('Terima kasih telah memesan di Warkop Si Bontot!', { align: 'center' });
            doc.text('Tunjukkan struk ini ke kasir untuk menyelesaikan pembayaran.', { align: 'center' });

            doc.end();
        } catch (err) {
            console.error('Error struk PDF:', err);
            return errorHandler(res, err, 500, err.message || 'Gagal generate struk');
        }
    }

    async destroy(req, res) {
        try {
            const { id } = req.params;
            const result = await Order.destroy(id);
            res.json({ success: true, message: 'Pesanan berhasil dihapus', data: result });
        } catch (err) {
            return errorHandler(res, err, 400, err.message || 'Gagal menghapus pesanan');
        }
    }
}

module.exports = new OrderController();