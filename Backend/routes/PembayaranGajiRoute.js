const express = require("express");
const {
    getPembayaranByNpsn,
    updatePembayaranGaji,
    getAllPembayaranGaji,
    getTingkatSekolah,
    getTahunPelajaran,
    BatalPembayaranGaji
} = require("../controllers/PembayaranGaji.js");
const verifyToken = require ("../middleware/VerifyToken.js");

const router = express.Router();

router.get("/DataGajiGuru/:npsn", verifyToken, getPembayaranByNpsn);
router.get("/DataGajiGuru/",verifyToken, getAllPembayaranGaji);
router.get("/TingkatSekolah/Guru/",verifyToken, getTingkatSekolah);
router.get("/TahunPelajaran/Guru/",verifyToken, getTahunPelajaran);
router.patch("/UpdateGajiGuru/:id",verifyToken, updatePembayaranGaji);
router.patch("/BatalGajiGuru/:id",verifyToken, BatalPembayaranGaji);

module.exports = router;
