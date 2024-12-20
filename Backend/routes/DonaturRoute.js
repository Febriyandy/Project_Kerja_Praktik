const express = require("express");
const {
    createDonaturYayasan,
    getDonaturAll,
    createArusDonatur,
    getArusDonaturByIdDonaturYayasan,
    deleteArusDonatur,
    getDonaturYayasanById,
    getSaldoPerBulan
} = require("../controllers/Donatur.js");
const verifyToken = require ("../middleware/VerifyToken.js");

const router = express.Router();

router.get("/DataDonatur/ById/:id", verifyToken, getDonaturYayasanById);
router.get("/DataDonatur", verifyToken, getDonaturAll);
router.get("/DataDonaturPerBulan",verifyToken,  getSaldoPerBulan);
router.get("/DataArusDonatur/ByIdDonaturYayasan/:id_donaturYayasan",verifyToken,  getArusDonaturByIdDonaturYayasan);
router.post("/TambahDonaturYayasan",verifyToken, createDonaturYayasan);   
router.post("/TambahArusDonatur/:id_donaturYayasan",verifyToken,  createArusDonatur);
router.delete("/HapusArusDonatur/:id",verifyToken, deleteArusDonatur);

module.exports = router;