const Users = require('../models/UserModel.js');
const jwt = require('jsonwebtoken');

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(401);

        const user = await Users.findAll({
            where: {
                refresh_token: refreshToken
            }
        });

        if (!user[0]) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403);

            const userId = user[0].id;
            const username = user[0].username;
            const npsn = user[0].npsn;
            const nama_sekolah = user[0].nama_sekolah;
            const accessToken = jwt.sign(
                { userId, username, npsn, nama_sekolah },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15s' }
            );

            res.json({ accessToken });
        });
    } catch (error) {
        console.error("Error in refreshToken:", error);
        res.sendStatus(500);
    }
};

