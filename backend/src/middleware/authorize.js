const errorHandler = require("../utils/errorhandler");

//middleware pembagian peran melalui role 
function authorize(role){
    return (req, res, next) =>{
        if (req.user.role !== role){
            return errorHandler(res, "Forbidden", 403, "Tidak Ada Akses");
        }
        next();
    }
}
module.exports = authorize;