
//biasanya routing api ini disebut dengan endpoint
const AuthController = require("../controllers/AuthController");
const StudentController = require("../controllers/StudentController");
const express = require("express");
const router = express.Router();
router.get("/", (req, res) =>{
    res.send("Hello Express");
});
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/register", (req, res) =>AuthController.register(req, res));
router.post("/login", (req, res) =>AuthController.login(req, res));

router.get("/students", auth, authorize("user"), (req, res)=> StudentController.index(req, res));
router.get("/students/:id", StudentController.show);
router.post("/students", StudentController.store);
router.put("/students/:id", StudentController.update);
router.delete("/students/:id", StudentController.destroy);

module.exports = router;