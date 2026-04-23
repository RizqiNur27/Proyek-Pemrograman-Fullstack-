function validateRegister(data){
    if(!data.email) return "email wajib diisi";
    if(!data.password) return "password wajib diisi";
    return null;
}
function validateLogin(data){
    if(!data.email) return "email wajib diisi";
    if(!data.password) return "password wajib diisi";
    return null;
}
module.exports = {validateRegister, validateLogin};