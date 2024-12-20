const express = require("express");
const {
    createKasSekolah,
    getKasSekolahByNPSN,
    getKasSekolahById,
    createArusKas,
    getArusKasByIdKasSekolah,
    updateArusKas,
    getArusKasById,
    deleteArusKas,
    getArusKasDanaBos,
    getTahunPelajaran,
    getArusKasDanaSPP,
    getArusKasAll,
    getArusKasDanaBosByNPSN
} = require("../controllers/ArusKas.js");
const verifyToken = require ("../middleware/VerifyToken.js");

const router = express.Router();

router.get("/DataArusKasAll/",verifyToken,  getArusKasAll);
router.get("/TahunPelajaranArusKas/",verifyToken, getTahunPelajaran);
router.get("/DataDanaBos", verifyToken, getArusKasDanaBos);
router.get("/DataDanaBosByNpsn/:npsn", verifyToken, getArusKasDanaBosByNPSN);
router.get("/DataDanaSPP", verifyToken, getArusKasDanaSPP);
router.get("/DataKasSekolah/ByNPSN/:npsn",verifyToken, getKasSekolahByNPSN);
router.get("/DataKasSekolah/ById/:id", verifyToken, getKasSekolahById);
router.get("/DataArusKas/ByIdKasSekolah/:id_kasSekolah",verifyToken,  getArusKasByIdKasSekolah);
router.get("/DataArusKas/ById/:id", verifyToken, getArusKasById);
router.post("/TambahKasSekolah",verifyToken, createKasSekolah);   
router.post("/TambahArusKas/:id_kasSekolah", createArusKas);
router.patch("/UpdateArusKas/:id", verifyToken, updateArusKas);
router.delete("/HapusArusKas/:id",verifyToken, deleteArusKas);

module.exports = router;