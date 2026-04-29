const Kategori = require("../model/kategori");
const errorHandler = require("../utils/errorhandler");

class KategoriController {
    async index(req, res) {
        try {
            const [results] = await Kategori.getAll();
            res.json({
                success: true, 
                message: "Berhasil mengambil data kategori",
                data: results 
            });
        } catch (err) {
            return errorHandler(res, err);
        }
    }
}

module.exports = new KategoriController();