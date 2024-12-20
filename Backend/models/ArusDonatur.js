const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Donatur = require('./DonaturModel.js');

const ArusDonatur = db.define('arus_donatur', {
    id_donaturYayasan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Donatur,
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

Donatur.hasMany(ArusDonatur, { foreignKey: 'id', as: 'kas_donatur' });
ArusDonatur.belongsTo(Donatur, { foreignKey: 'id_donaturYayasan', as: 'kas_donatur' });

module.exports = ArusDonatur;
