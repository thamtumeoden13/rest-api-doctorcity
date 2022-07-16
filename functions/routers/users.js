const express = require('express');

// const {
//     getUsers,
//     getUser, 
//     createUser, updateUser, deleteUser
// } = require('../controllers/users.js');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/users.js');

const auth = require('../middleware/auth.js');

const router = express.Router()

router.get('/', getUsers);

router.get('/:id', getUser);

router.post('/', auth, createUser);

router.patch('/:id', auth, updateUser);

router.delete('/:id', auth, deleteUser)

module.exports = router