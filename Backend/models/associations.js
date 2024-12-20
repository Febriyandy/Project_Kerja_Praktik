const Sekolah = require('./SekolahModel.js');
const Siswa = require('./SiswaModel.js');
const Pembayaran = require('./PembayaranModel.js');

// Define relationships
Sekolah.hasMany(Siswa, { foreignKey: 'npsn' });
Siswa.belongsTo(Sekolah, { foreignKey: 'npsn', allowNull: false });

Siswa.hasMany(Pembayaran, { foreignKey: 'nisn' });
Pembayaran.belongsTo(Siswa, { foreignKey: 'nisn', allowNull: false });

module.exports = {
    Sekolah,
    Siswa,
    Pembayaran
};
