const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Sekolah = require('./SekolahModel.js');

const KasSekolah = db.define('kas_sekolah', {
    npsn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sekolah,
            key: 'npsn'
        }
    },
    tahun_pelajaran: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
}, {
    freezeTableName: true,
    timestamps: true
});

Sekolah.hasMany(KasSekolah, { foreignKey: 'npsn' });
KasSekolah.belongsTo(Sekolah, { foreignKey: 'npsn', allowNull: false });



module.exports = KasSekolah;
