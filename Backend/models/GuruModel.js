const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Sekolah = require('./SekolahModel.js');

const Guru = db.define('guru', {
    npsn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sekolah,
            key: 'npsn'
        }
    },
    nama_guru: {
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
    gaji_guru: {
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

Sekolah.hasMany(Guru, { foreignKey: 'npsn' });
Guru.belongsTo(Sekolah, { foreignKey: 'npsn', allowNull: false });

module.exports = Guru;
