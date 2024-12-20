const express = require("express");
const {
    getPembayaranByNpsnAndKelas,
    UpdatePembayaran,
    getAllPembayaran,
    getTingkatSekolah, 
    BatalPembayaran,
    getAllPembayaranByNPSN
} = require("../controllers/Pembayaran.js");
const verifyToken = require ("../middleware/VerifyToken.js");

const router = express.Router();

router.get("/DataSPPsekolah/:npsn", verifyToken, getAllPembayaranByNPSN);
router.get("/DataSPPsiswa/",verifyToken, getAllPembayaran);
router.get("/TingkatSekolah/",verifyToken, getTingkatSekolah);
router.get("/DataSPPsiswa/:kelas",verifyToken, getPembayaranByNpsnAndKelas);
router.patch("/UpdateSPPsiswa/:id", verifyToken, UpdatePembayaran);
router.patch("/BatalSPPsiswa/:id", verifyToken, BatalPembayaran);

module.exports = router;
