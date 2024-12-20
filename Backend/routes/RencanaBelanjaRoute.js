const express = require("express");
const {
    createPengajuan,
    getPengajuanByNPSN,
    createBelanja, 
    updateTTDPengajuanBelanja,
    getBelanjaByIdPengajuan,
    getPengajuanById,
    updateBelanja,
    getBelanjaById,
    deleteBelanja,
    updateBelanjaByAdmin
} = require("../controllers/RencanaBelanja.js");
const verifyToken = require ("../middleware/VerifyToken.js");

const router = express.Router();

router.patch("/UpdateTtdPengajuan/:id",verifyToken,  updateTTDPengajuanBelanja);
router.get("/DataPengajuanById/:id",verifyToken, getPengajuanById);
router.get("/DataPengajuanByNPSN/:npsn", verifyToken, getPengajuanByNPSN);
router.get("/DataBelanjaById/:id",verifyToken,  getBelanjaById);
router.get("/DataBelanjaByIdPengajuan/:id_pengajuan", verifyToken, getBelanjaByIdPengajuan);
router.post("/TambahPengajuan",verifyToken, createPengajuan);
router.post("/TambahBelanja/:id_pengajuan", createBelanja);
router.patch("/UpdateBelanja/:id", verifyToken, updateBelanja);
router.patch("/UpdateBelanjaByAdmin/:id", verifyToken, updateBelanjaByAdmin);
router.delete("/HapusBelanja/:id",verifyToken, deleteBelanja);

module.exports = router;
