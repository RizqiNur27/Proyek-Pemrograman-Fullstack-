const db = require('../config/db');
const PDFDocument = require('pdfkit');

exports.getDashboardOverview = async (req, res) => {
  try {
    const [transaksi] = await db.query("SELECT SUM(total_harga) AS total_pendapatan FROM transaksi WHERE status_pembayaran = 'lunas'");
    const [ordersCount] = await db.query("SELECT COUNT(*) AS total_pesanan FROM orders");
    const [pelangganCount] = await db.query("SELECT COUNT(DISTINCT id_user) AS pelanggan_aktif FROM orders");

    const [recentOrders] = await db.query(`
      SELECT o.id_order, COALESCE(o.nama_pemesan, u.nama) AS nama_pelanggan, o.tipe_layanan, o.status,
             COALESCE((SELECT SUM(subtotal) FROM order_detail od WHERE od.id_order = o.id_order), 0) AS total_tagihan,
             (SELECT GROUP_CONCAT(CONCAT(m.nama_menu, ' x', od.jumlah) SEPARATOR ', ')
              FROM order_detail od
              JOIN menu m ON od.id_menu = m.id_menu
              WHERE od.id_order = o.id_order) AS produk_ringkasan
      FROM orders o
      LEFT JOIN users u ON o.id_user = u.id_user
      ORDER BY o.id_order DESC
      LIMIT 5
    `);

    const [topProducts] = await db.query(`
      SELECT m.nama_menu, SUM(od.jumlah) AS total_terjual, m.harga, m.id_kategori
      FROM order_detail od
      JOIN menu m ON od.id_menu = m.id_menu
      JOIN orders o ON od.id_order = o.id_order
      JOIN transaksi t ON t.id_order = o.id_order
      WHERE t.status_pembayaran = 'lunas'
      GROUP BY od.id_menu
      ORDER BY total_terjual DESC
      LIMIT 4
    `);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalPendapatan: transaksi[0].total_pendapatan || 0,
          totalPesanan: ordersCount[0].total_pesanan || 0,
          pelangganAktif: pelangganCount[0].pelanggan_aktif || 0,
        },
        recentOrders,
        topProducts
      }
    });

  } catch (error) {
    console.error("Error Dashboard:", error);
    res.status(500).json({ status: 'error', message: 'Gagal muat data dashboard bray' });
  }
};

exports.getHarian = async (req, res) => {
  try {
    const [harian] = await db.query(`
      SELECT m.id_menu, m.nama_menu, m.harga,
             COALESCE(SUM(od.jumlah), 0) AS total_terjual,
             COALESCE(SUM(od.subtotal), 0) AS total_pendapatan
      FROM menu m
      LEFT JOIN order_detail od ON m.id_menu = od.id_menu
      LEFT JOIN orders o ON od.id_order = o.id_order AND DATE(o.tanggal) = CURDATE()
      LEFT JOIN transaksi t ON t.id_order = o.id_order AND t.status_pembayaran = 'lunas'
      GROUP BY m.id_menu
      ORDER BY total_terjual DESC
    `);

    const [totalHari] = await db.query(`
      SELECT COALESCE(SUM(t.total_harga), 0) AS total_pendapatan,
             COUNT(DISTINCT o.id_order) AS total_pesanan
      FROM orders o
      LEFT JOIN transaksi t ON t.id_order = o.id_order
      WHERE DATE(o.tanggal) = CURDATE()
    `);

    res.json({
      status: 'success',
      data: {
        items: harian,
        ringkasan: {
          totalPendapatan: totalHari[0].total_pendapatan,
          totalPesanan: totalHari[0].total_pesanan
        }
      }
    });

  } catch (error) {
    console.error("Error Harian:", error);
    res.status(500).json({ status: 'error', message: 'Gagal muat data harian' });
  }
};

exports.exportPdf = async (req, res) => {
  try {
    const [harian] = await db.query(`
      SELECT m.nama_menu, COALESCE(SUM(od.jumlah), 0) AS total_terjual,
             COALESCE(SUM(od.subtotal), 0) AS total_pendapatan
      FROM menu m
      LEFT JOIN order_detail od ON m.id_menu = od.id_menu
      LEFT JOIN orders o ON od.id_order = o.id_order AND DATE(o.tanggal) = CURDATE()
      LEFT JOIN transaksi t ON t.id_order = o.id_order AND t.status_pembayaran = 'lunas'
      GROUP BY m.id_menu
      HAVING total_terjual > 0
      ORDER BY total_terjual DESC
    `);

    const [totalHari] = await db.query(`
      SELECT COALESCE(SUM(t.total_harga), 0) AS total_pendapatan,
             COUNT(DISTINCT o.id_order) AS total_pesanan
      FROM orders o
      LEFT JOIN transaksi t ON t.id_order = o.id_order
      WHERE DATE(o.tanggal) = CURDATE()
    `);

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="laporan-harian-${new Date().toISOString().slice(0,10)}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).font('Helvetica-Bold').text('Warkop Si Bontot', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Laporan Penjualan Harian', { align: 'center' });
    doc.fontSize(10).text(today, { align: 'center' });
    doc.moveDown();

    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Total Pendapatan: Rp ${Number(totalHari[0].total_pendapatan).toLocaleString('id-ID')}`);
    doc.text(`Total Pesanan: ${totalHari[0].total_pesanan}`);
    doc.moveDown();

    // Table header
    const startX = 30;
    let y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('No', startX, y, { width: 30 });
    doc.text('Menu', startX + 30, y, { width: 200 });
    doc.text('Terjual', startX + 230, y, { width: 60, align: 'center' });
    doc.text('Pendapatan', startX + 300, y, { width: 120, align: 'right' });
    doc.moveDown(0.5);
    y = doc.y;
    doc.moveTo(startX, y).lineTo(startX + 420, y).stroke();
    doc.moveDown(0.5);

    harian.forEach((item, i) => {
      y = doc.y;
      doc.font('Helvetica').fontSize(9);
      doc.text(String(i + 1), startX, y, { width: 30 });
      doc.text(item.nama_menu, startX + 30, y, { width: 200 });
      doc.text(String(item.total_terjual), startX + 230, y, { width: 60, align: 'center' });
      doc.text(`Rp ${Number(item.total_pendapatan).toLocaleString('id-ID')}`, startX + 300, y, { width: 120, align: 'right' });
      doc.moveDown(0.8);
    });

    doc.moveDown(0.5);
    y = doc.y;
    doc.moveTo(startX, y).lineTo(startX + 420, y).stroke();

    doc.moveDown();
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Total Keseluruhan: Rp ${Number(totalHari[0].total_pendapatan).toLocaleString('id-ID')}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error("Error PDF:", error);
    res.status(500).json({ status: 'error', message: 'Gagal generate PDF' });
  }
};
