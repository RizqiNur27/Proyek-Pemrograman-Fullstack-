const Menu = require("../model/menu"); // Memanggil model menu baru
const errorHandler = require("../utils/errorhandler");

class MenuController {
    // Menampilkan semua daftar menu
    async index(req, res) {
        try {
            const [results] = await Menu.getAll();
            if (results.length === 0) {
                return res.status(404).json({ message: "Daftar menu kosong" });
            }
            res.json({
                success: true,
                message: "Berhasil mengambil data menu",
                data: results
            });
        } catch (err) {
            return errorHandler(res, err);
        }
    }

    // Menampilkan detail menu berdasarkan ID
    async show(req, res) {
        const { id } = req.params;
        try {
            const [results] = await Menu.getByID(id);
            if (results.length === 0) {
                return res.status(404).json({ message: "Menu tidak ditemukan" });
            }
            res.json({
                success: true,
                data: results[0]
            });
        } catch (err) {
            return errorHandler(res, err);
        }
    }

    // Menambahkan menu baru
    async store(req, res) {
        const data = req.body; 
        // Pastikan input sesuai kolom: id_kategori, nama_menu, harga
        try {
            await Menu.create(data);
            res.status(201).json({
                success: true,
                message: "Menu berhasil ditambahkan",
                data: data
            });
        } catch (err) {
            return errorHandler(res, err, 500, "Gagal tambah menu");
        }
    }

    async update(req, res) {
        const { id } = req.params;
        const data = req.body;
        try {
            await Menu.update(id, data);
            res.json({ message: `Berhasil mengubah data menu ID: ${id}` });
        } catch (err) {
            return errorHandler(res, err);
        }
    }

    async destroy(req, res) {
        const { id } = req.params;
        try {
            await Menu.delete(id);
            res.json({ message: `Berhasil menghapus menu ID: ${id}` });
        } catch (err) {
            return errorHandler(res, err);
        }
    }
}

module.exports = new MenuController();