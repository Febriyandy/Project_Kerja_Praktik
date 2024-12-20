const express = require("express");
const {
  Home,
  createSiswa,
  getAllSiswa,
  getSiswaByNisn,
  getSiswaByNpsnAndKelas,
  updateSiswa,
  getTahunPelajaran,
  getSiswaByNpsn,
  deleteSiswa,
} = require("../controllers/Siswa.js");
const verifyToken = require ("../middleware/VerifyToken.js");

const router = express.Router();

router.get("/", Home);
router.get("/TahunPelajaran",verifyToken, getTahunPelajaran);
router.get("/DataSiswa", getAllSiswa);
router.get("/DataSiswa/:nisn", verifyToken, getSiswaByNisn);
router.get("/DataSiswaSekolah/:npsn/", verifyToken, getSiswaByNpsn);
router.get("/DataSiswaSekolah/:npsn/:kelas", verifyToken, getSiswaByNpsnAndKelas);
router.post("/TambahSiswa",verifyToken, createSiswa);
router.patch("/EditDataSiswa/:nisn",verifyToken, updateSiswa);
router.delete("/HapusDataSiswa/:nisn/:tahun_pelajaran/:npsn/:kelas",verifyToken, deleteSiswa);

module.exports = router;
