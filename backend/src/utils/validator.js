function validateStudent(data){
    if(!data.name){
        return "Nama Harus diisi";
    }
    if(!data.birth_date){
        return "Tanggal Lahir Wajib diisi"
    }
    if(!data.gender){
        return "Gender wajib diisi";
    }
    if(data.classes_id && isNaN(data.classes_id)){
        return "classes_id Harus Angka";
    }
    return null;
}
function validateId(id){
    if (!id || isNaN(id)){
        return "Id Tidak Valid";
    }
    return null;
}
module.exports = {validateStudent, validateId};