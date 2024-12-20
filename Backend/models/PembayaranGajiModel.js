const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Guru = require('./GuruModel.js');

const PembayaranGaji = db.define('pembayaran_gaji', {
    id_guru: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Guru,
            key: 'id'
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

Guru.hasMany(PembayaranGaji, { foreignKey: 'id' });
PembayaranGaji.belongsTo(Guru, { foreignKey: 'id', allowNull: false });

module.exports = PembayaranGaji;
