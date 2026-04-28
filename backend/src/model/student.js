const db = require('../config/db');

class Student{
    //model menampilkan data
    static getAll(callback){
        const sql = "SELECT * FROM student";
        db.query(sql, callback);
    }
    //menampilkan data by id
    static getByID(id, callback){
        const sql = "SELECT * FROM student WHERE id = ?";
        db.query(sql, [id], callback);
    }

    //create model data 
    static create (data, callback){
        //query insert
        const sql = `
        INSERT INTO student (name, birth_date, gender, classes_id, photo)
        VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            data.name,
            data.birth_date,
            data.gender,
            data.classes_id,
            data.photo
        ], callback);
    }
    static update (id, data, callback){
        const sql = `
        INSERT INTO student name=?, birth_date=?, gender, 
        class_id=?, photo=? WHERE id=?
        `;
        db.query(sql, [
            data.name,
            data.birth_date,
            data.gender,
            data.classes_id,
            data.photo,
            id
        ], callback);
    }
    static delete (id, callback){
        const sql = "DELETE FROM student WHERE id=?";
        db.query(sql, [id], callback);
    }
    
}
module.exports = Student;