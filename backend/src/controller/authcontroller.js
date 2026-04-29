const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const { validateRegister, validateLogin } = require("../utils/authvalidator");
const errorHandler = require("../utils/errorhandler");

class AuthController {
    async register(req, res) {
        try {
            const data = req.body;
            const error = validateRegister(data);
            
            if (error) {
                return errorHandler(res, error, 400, error);
            }

            // Panggil model menggunakan await, bukan callback
            const existingUsers = await User.findByEmail(data.email);
            
            if (existingUsers.length > 0) {
                return errorHandler(res, "Email sudah ada", 400, "Terdaftar");
            }

            const hashed = await bcrypt.hash(data.password, 10);
            const user = {
                nama: data.nama,
                email: data.email,
                password: hashed,
                role: data.role || "pelanggan"
            };

            // Panggil fungsi create dengan await
            await User.create(user);
            
            res.status(201).json({
                success: true,
                message: "Register Berhasil"
            });
            
        } catch (err) {
            // Jika ada error dari database, akan ditangkap di sini
            return errorHandler(res, err, 500, "Internal Server Error saat registrasi");
        }
    }

    async login(req, res) {
        try {
            const data = req.body;
            const error = validateLogin(data);
            
            if (error) {
                return errorHandler(res, error, 400, error);
            }

            const existingUsers = await User.findByEmail(data.email);
            
            if (existingUsers.length === 0) {
                return errorHandler(res, "Not Found", 404, "Email tidak ada");
            }

            const user = existingUsers[0];
            const match = await bcrypt.compare(data.password, user.password);
            
            if (!match) {
                return errorHandler(res, "Password salah", 401, "Login gagal");
            }

            // Pastikan menggunakan id_user sesuai dengan skema database Warkop
            const token = jwt.sign(
                {
                    id: user.id_user,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({
                success: true,
                message: "Login Berhasil",
                token
            });
            
        } catch (err) {
            return errorHandler(res, err, 500, "Internal Server Error saat login");
        }
    }
}

module.exports = new AuthController();