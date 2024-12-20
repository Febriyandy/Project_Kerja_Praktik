const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const InfaqYayasan = require('./InfaqYayasanModel.js');

const ArusInfaq = db.define('arus_infaq', {
    id_infaqYayasan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: InfaqYayasan,
            key: 'id'
        }
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
    satuan: {
        type: DataTypes.STRING,
        allowNull: true, 
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

InfaqYayasan.hasMany(ArusInfaq, { foreignKey: 'id', as: 'kas_infaq' });
ArusInfaq.belongsTo(InfaqYayasan, { foreignKey: 'id_infaqYayasan', as: 'kas_infaq' });

module.exports = ArusInfaq;
