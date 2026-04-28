const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const User = require("../model/user");
const {validateRegister, validateLogin} = require("../utils/authvalidator");
const errorHandler = require("../utils/errorhandler");
class AuthController {
    register(req, res){
        const data = req.body;
        const error = validateRegister(data);
        if(error){
            return errorHandler(res, error, 400, error);
        }
        //cek email 
        User.findByEmail(data.email, async(err, result)=>{
            if(err){
                return errorHandler(res, err);
            }
            if(result.length > 0 ){
                return errorHandler(res, "Email sudah ada", 400, "Terdaftar");
            }
            const hashed = await bcrypt.hash(data.password, 10);
            const user = {
                email: data.email,
                password: hashed,
                role: data.role || "user"
            };
            User.create(user, (err)=>{
                if(err){
                    return errorHandler(res, err);
                }
                res.status(201).json({
                    success: true,
                    message: "Register Berhasil"
                });
            });
        });
    }

    login(req, res){
        const data = req.body;
        const error = validateLogin(data);
        if(error){
            return errorHandler(res, error, 400, error);
        }
        User.findByEmail(data.email, async(err, result)=>{
            if(err){
                return errorHandler(res, err);
            }
            if(result.length === 0){
                return errorHandler(res, "Not Found", 404, "Email tidak ada");
            }
            const user = result[0];
            const match = await bcrypt.compare(data.password, user.password);
            if(!match){
                return errorHandler(res, "Password salah", 401, "Login gagal");
            }
            const token = jwt.sign(
                {
                    id : user.user_id,
                    role: user.role
                }, 
                process.env.JWT_SECRET, 
                {expiresIn: "1h"}
            );
            res.json({
                success: true,
                message: "Login Berhasil",
                token
            });
        });
    }
}

module.exports = new AuthController();