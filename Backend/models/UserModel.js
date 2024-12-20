const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');
const Sekolah = require('./SekolahModel.js');

const Users = db.define('users',{  
    npsn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sekolah,
            key: 'npsn'
        }
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            len: [3, 100]
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    nama_sekolah:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    refresh_token:{
        type: DataTypes.TEXT
    }
},{
    freezeTableName: true
});

Sekolah.hasMany(Users, { foreignKey: 'npsn' });
Users.belongsTo(Sekolah, { foreignKey: 'npsn', allowNull: false });

module.exports = Users;