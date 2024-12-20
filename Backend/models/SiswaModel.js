const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Sekolah = require('./SekolahModel.js');

const Siswa = db.define('siswa', {
    npsn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sekolah,
            key: 'npsn'
        }
    },
    nisn: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    nama_siswa: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    kelas: {
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
    nama_orangtua: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    no_hp_orangtua: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    biaya_spp: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true,
    timestamps: true
});

Sekolah.hasMany(Siswa, { foreignKey: 'npsn' });
Siswa.belongsTo(Sekolah, { foreignKey: 'npsn', allowNull: false });


module.exports = Siswa;
