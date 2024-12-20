const express = require("express");
const {
  createGuru,
  getAllGuru,
  getGuruById,
  getGuruByNpsn,
  updateGuru,
  getTahunPelajaran,
  deleteGuru,
} = require("../controllers/Guru.js");
const verifyToken = require ("../middleware/VerifyToken.js");

const router = express.Router();

router.get("/TahunPelajaranGuru",verifyToken, getTahunPelajaran);
router.get("/DataGuru", verifyToken, getAllGuru);
router.get("/DataGuru/:id", verifyToken, getGuruById);
router.get("/DataGuruSekolah/:npsn", verifyToken, getGuruByNpsn);
router.post("/TambahGuru",verifyToken, createGuru);
router.patch("/EditDataGuru/:id",verifyToken,  updateGuru);
router.delete("/HapusDataGuru/:id",verifyToken, deleteGuru);

module.exports = router;
