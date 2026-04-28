const Student = require("../model/student");
const {validateStudent, validateId} = require("../utils/validator");
const errorHandler = require("../utils/errorhandler");
class StudentController{
    index(req, res){
       Student.getAll((err, results)=>{
        if(err){
            return res.json({
                message: "Gagal ambil data",
                error: err
            });
        }
        //validation jika datanya kosong
        if (results.length == 0){
            return res.status(404).json({
                message: "Data Kosong"
            });
        }
        res.json({
            message: "Berhasil ambil data",
            data: results
        });
       });
        
    }
    //controller menampilkan detail data 
    show(req, res){
        const {id} = req.params;
        Student.getByID(id, (err, results)=>{
            if(err){
                return res.json({message: "Data tidak ditemukan"});
            }
            res.json({
                message: "Detail Student",
                data: results[0]
            });
        });
    }
    //menambahkan data
     store(req, res){
        const data = req.body;
        //memanggil validasi
        const error = validateStudent(data);
        if(error) {
            // return res.status(400).json({message: error});
            return errorHandler(res, error, 400, error);
        }
        Student.create(data, (err)=>{
            if(err){
            // return res.status(500).json({message: "Gagal Tambah Data"});
            return errorHandler(res, err, 500, "Gagal Tambah Data");
            }
            res.status(201).json({
                message: "Data Berhasil Ditambahkan",
                data: data
            });
        });
    }
    update(req, res){
        const {id} = req.params;
        res.send(`Mengubah data Students ${id}`);
    }
    destroy(req, res){
                const {id} = req.params;
        res.send(`Menghapus data Students ${id}`);
    }
}
const object = new StudentController();

module.exports = object;