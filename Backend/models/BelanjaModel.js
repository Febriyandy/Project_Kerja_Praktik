const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Pengajuan = require('./PengajuanBelanjaModel.js');

const Belanja = db.define('belanja', {
    id_pengajuan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Pengajuan,
            key: 'id'
        }
    },
    kode_nota: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null values
        validate: {
            notEmpty: false
        }
    },
    tanggal_pengajuan: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null values
        validate: {
            notEmpty: false
        }
    },
    nama_barang: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null values
        validate: {
            notEmpty: false
        }
    },
    jumlah_barang: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null values
        validate: {
            notEmpty: false
        }
    },
    harga_satuan: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null values
        validate: {
            notEmpty: false
        }
    },
    total_harga: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null values
        defaultValue: '0'
    },
    status_pengajuan: {
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
        },
        defaultValue: '-'
    },
}, {
    freezeTableName: true,
    timestamps: true
});

Pengajuan.hasMany(Belanja, { foreignKey: 'id', as: 'pengajuan_belanja' });
Belanja.belongsTo(Pengajuan, { foreignKey: 'id_pengajuan', as: 'pengajuan_belanja' });

module.exports = Belanja;
