const express = require("express");
const {
    createInfaqYayasan,
    getInfaqAll,
    createArusInfaq,
    getArusInfaqByIdInfaqYayasan,
    deleteArusInfaq,
    getInfaqYayasanById
} = require("../controllers/Infaq.js");
const verifyToken = require ("../middleware/VerifyToken.js");

const router = express.Router();

router.get("/DataInfaq/ById/:id", verifyToken, getInfaqYayasanById);
router.get("/DataInfaq", verifyToken, getInfaqAll);
router.get("/DataArusInfaq/ByIdInfaqYayasan/:id_infaqYayasan",verifyToken,  getArusInfaqByIdInfaqYayasan);
router.post("/TambahInfaqYayasan",verifyToken, createInfaqYayasan);   
router.post("/TambahArusInfaq/:id_infaqYayasan",verifyToken,  createArusInfaq);
router.delete("/HapusArusInfaq/:id",verifyToken, deleteArusInfaq);

module.exports = router;