const Users = require('../models/UserModel.js');
const Sekolah = require('../models/SekolahModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.Login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({
            where: {
                username: username,
            },
            include: [{
                model: Sekolah, 
                attributes: ['tingkat_sekolah'],
            }]
        });

        if (!user) {
            return res.status(400).json({ msg: "Username tidak ditemukan, silahkan daftar" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ msg: "Password Salah, harap coba lagi" });
        }

        const { id: userId, role, npsn, nama_sekolah } = user;
        const accessToken = jwt.sign(
            { userId, username, role, nama_sekolah }, 
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '20s',
            }
        );

        const refreshToken = jwt.sign(
            { userId, username, role, nama_sekolah }, // tambahkan tingkat_sekolah ke payload
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: '1d',
            }
        );

        await Users.update(
            { refresh_token: refreshToken },
            {
                where: {
                    id: userId,
                },
            }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken, role, username, npsn, nama_sekolah });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

exports.Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });

    if (!user[0]) return res.sendStatus(204);

    const userId = user[0].id;
    await Users.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    });

    res.clearCookie('refreshToken');
    return res.sendStatus(200);
};

exports.addUser = async (req, res) => {
    try {
        const { username, password, confirmPassword, role, npsn, nama_sekolah } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ msg: "Password dan konfirmasi password tidak cocok" });
        }

        // Check if user already exists
        const existingUser = await Users.findOne({ where: { username: username } });
        if (existingUser) {
            return res.status(400).json({ msg: "Username sudah digunakan, silakan pilih username lain" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        await Users.create({
            username,
            password: hashedPassword,
            role,
            npsn,
            nama_sekolah
        });

        res.status(201).json({ msg: "User berhasil ditambahkan" });
    } catch (error) {
        console.error("Error in adding user:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// API untuk memperbarui password user dengan konfirmasi password
exports.updatePassword = async (req, res) => {
    try {
        const { username, oldPassword, newPassword, confirmPassword } = req.body;

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ msg: "Password baru dan konfirmasi password tidak cocok" });
        }

        // Find user by username
        const user = await Users.findOne({ where: { username: username } });
        if (!user) {
            return res.status(400).json({ msg: "Username tidak ditemukan" });
        }

        // Verify old password
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return res.status(400).json({ msg: "Password lama salah" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await Users.update({ password: hashedNewPassword }, {
            where: {
                id: user.id
            }
        });

        res.status(200).json({ msg: "Password berhasil diperbarui" });
    } catch (error) {
        console.error("Error in updating password:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            include: [{
                model: Sekolah,
                attributes: ['tingkat_sekolah'],
            }],
            attributes: { exclude: ['password', 'refresh_token'] } // Jangan kembalikan password dan refresh token
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getting all users:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// API untuk menghapus user berdasarkan userId
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        await Users.destroy({
            where: {
                id: id
            }
        });

        res.status(200).json({ msg: "User berhasil dihapus" });
    } catch (error) {
        console.error("Error in deleting user:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

