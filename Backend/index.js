const express = require("express");
const db = require("./config/Database.js");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const FileUpload = require("express-fileupload");
const SiswaRoute = require ("./routes/SiswaRoute.js");
const UserRoute = require ("./routes/UserRoute.js");
const PembayaranRoute = require ("./routes/PembayaranRoute.js");
const PembayaranGajiRoute = require ("./routes/PembayaranGajiRoute.js");
const RencanaBelanjaRoute = require ("./routes/RencanaBelanjaRoute.js")
const ArusKasRoute = require ("./routes/ArusKasRoute.js");
const InfaqRoute = require ("./routes/InfaqRoute.js");
const DonaturRoute = require ("./routes/DonaturRoute.js");
const GuruRoute = require ("./routes/GuruRoute.js");
// const Donatur = require ("./models/DonaturModel.js");
// const ArusDonatur = require ("./models/ArusDonatur.js");
//const Siswa = require("./models/SiswaModel.js");
// const Guru = require("./models/GuruModel.js");
//const Sekolah = require("./models/SekolahModel.js");
//const Users = require("./models/UserModel.js");
//const Pembayaran = require("./models/PembayaranModel.js");
// const PembayaranGaji = require("./models/PembayaranGajiModel.js");
//const Pengajuan =require("./models/PengajuanBelanjaModel.js");
//const Belanja = require("./models/BelanjaModel.js");
//const KasSekolah = require("./models/KasSekolahModel.js");
//const InfaqYayasan = require("./models/InfaqYayasanModel.js");
//const ArusInfaq = require("./models/ArusInfaqModel.js");



dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;
const server_host = process.env.YOUR_HOST || '0.0.0.0';

(async () => {
    try {
        await db.authenticate();
        console.log('Database Connected..');
        //await PembayaranGaji.sync();
    } catch (error) {
        console.error(error);
    }
})();

app.use(cors({ credentials:true, origin: 'http://localhost:5173' }));
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(SiswaRoute);
app.use(UserRoute);
app.use(PembayaranRoute);
app.use(RencanaBelanjaRoute);
app.use(ArusKasRoute);
app.use(InfaqRoute);
app.use(DonaturRoute);
app.use(GuruRoute);
app.use(PembayaranGajiRoute);

app.listen(PORT, server_host, () => {
    console.log(`Server up and running on port ${PORT}...`);
});
