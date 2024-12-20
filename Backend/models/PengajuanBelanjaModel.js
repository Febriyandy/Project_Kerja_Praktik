const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Sekolah = require('./SekolahModel.js');

const Pengajuan = db.define('pengajuan_belanja', {
    npsn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sekolah,
            key: 'npsn'
        }
    },
    bulan: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    tahun_pelajaran: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    ttd_kasir: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ttd_bendahara: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
}, {
    freezeTableName: true,
    timestamps: true
});

Sekolah.hasMany(Pengajuan, { foreignKey: 'npsn' });
Pengajuan.belongsTo(Sekolah, { foreignKey: 'npsn', allowNull: false });



module.exports = Pengajuan;
