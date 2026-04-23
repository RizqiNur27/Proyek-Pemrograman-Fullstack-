const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/errorhandler");

//middleware auth => membatasi akses sistem dari user 
function auth (req, res, next){
    const bearer = req.headers.authorization;
    if(!bearer){
        return errorHandler(res, "Unauthorized", 401, "Token Tidak valid");
    }
    const token = bearer.split(" ")[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err){
        return errorHandler(res, err, 401, "Token tidak valid");
    }
}
module.exports = auth;