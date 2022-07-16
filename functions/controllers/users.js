
const admin = require('firebase-admin');

const getUsers = async (req, res) => {

    try {
        const snapshot = await admin.firestore().collection("User").get();

        let users = []
        snapshot.forEach((doc) => {
            let id = doc.id;
            let data = doc.data();

            users.push({ id, ...data })
        })

        res.status(200).send(JSON.stringify(users))
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

const getUser = async (req, res) => {
    const { id } = req.params
    try {
        const snapshot = await admin.firestore().collection("User").doc(id).get();

        const userId = snapshot.id;
        const userData = snapshot.data();

        res.status(200).send(JSON.stringify({ id: userId, ...userData }));
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

const createUser = async (req, res) => {
    const user = req.body;

    try {
        await admin.firestore().collection("User").add(user);

        res.status(201).send();
    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const user = req.body;

    try {
        await admin.firestore().collection("User").doc(id).update(user);

        res.status(200).send();
    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    try {
        await admin.firestore().collection("User").doc(id).delete();

        res.status(200).send();
    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser }