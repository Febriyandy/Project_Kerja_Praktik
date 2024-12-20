const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Siswa = require('./SiswaModel.js');

const Pembayaran = db.define('pembayaran', {
    id_siswa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Siswa,
            key: 'id'
        }
    },
    nisn: {
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
    januari: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    februari: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    maret: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    april: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    mei: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    juni: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    juli: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    agustus: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    september: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    oktober: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    november: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
    desember: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    }
}, {
    freezeTableName: true,
    timestamps: true
});

Siswa.hasMany(Pembayaran, { foreignKey: 'id' });
Pembayaran.belongsTo(Siswa, { foreignKey: 'id', allowNull: false });

module.exports = Pembayaran;
