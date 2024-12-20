const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const KasSekolah = require('./KasSekolahModel.js');

const ArusKas = db.define('arus_kas', {
    id_kasSekolah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: KasSekolah,
            key: 'id'
        }
    },
    kode_nota: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    bulan: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null values
        validate: {
            notEmpty: false
        }
    },
    tanggal: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null values
        validate: {
            notEmpty: false
        }
    },
    keterangan: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null values
        validate: {
            notEmpty: false
        }
    },
    debit: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null values
        defaultValue: '0'
    },
    kredit: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null values
        defaultValue: '0'
    },
    saldo: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null values
        defaultValue: '0'
    },
   
}, {
    freezeTableName: true,
    timestamps: true
});

KasSekolah.hasMany(ArusKas, { foreignKey: 'id_kasSekolah', as: 'kas_sekolah' });
ArusKas.belongsTo(KasSekolah, { foreignKey: 'id_kasSekolah', as: 'kas_sekolah' });

module.exports = ArusKas;
