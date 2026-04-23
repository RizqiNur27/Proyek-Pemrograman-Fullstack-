const errorHandler = (res, error, status = 500, 
    message = "Terjadi Kesalahan")=>{
        console.error(error); //untuk log

        return res.status(status).json({
            success: false,
            message: message,
            error: error?.message || error
        });
    };

module.exports = errorHandler;