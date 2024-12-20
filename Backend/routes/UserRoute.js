const express = require("express");
const {
   addUser,
   updatePassword,
    Login, 
    Logout,
    getAllUsers,
    deleteUser
} = require ("../controllers/Users.js");
const verifyToken  = require ("../middleware/VerifyToken.js");
const { refreshToken } = require ("../controllers/RefreshToken.js");

const router = express.Router();

router.post('/login', Login);
router.post('/tambahUser', verifyToken, addUser);
router.patch('/updatePassword',verifyToken, updatePassword);
router.post('/login', Login);
router.get('/token', refreshToken);
router.get('/dataUser',verifyToken, getAllUsers);
router.delete('/hapusUser/:id',verifyToken, deleteUser);
router.delete('/logout', Logout);
 

module.exports = router;