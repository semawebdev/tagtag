const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User")
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/jwt");

router.post('/signup', (req, res, next) => {
    const { name, email, password } = req.body
    if (email === '' || name === '' || password === "") {
        res.status(400).json({ message: "Enter email, password and name" })
        return
    }

    const emailValid = email.includes('@')
    if (!emailValid) {
        res.status(400).json({ message: "Enter a valid email address" })
        return
    }

    if (password.length < 6) {
        res.status(400).json({ message: "Password has to be 6 characters minimum" })
    }

    User.findOne({ email })
        .then(foundUser => {
            if (foundUser) {
                res.status(400).json({ message: "User already exists!" })
            }

            const salt = bcrypt.genSaltSync();
            const hashedPassword = bcrypt.hashSync(password, salt);

            return User.create({ email, password: hashedPassword, name })
                .then(createdUser => {
                    const { email, name, _id } = createdUser
                    const user = { email, name, _id }
                    res.status(201).json({ user: user })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({ message: 'Internal Server Error' })
                })
        })

});

router.post('/login', (req, res, next) => {
    const { name, email, password } = req.body
    if (email === '' || password === "") {
        res.status(400).json({ message: "Enter email and password" })
        return
    }
    User.findOne({ email })
        .then(foundUser => {
            if (!foundUser) {
                res.status(400).json({ message: "User not found" })
                return
            }
            const passwordCorrect = bcrypt.compareSync(password, foundUser.password)
            if (passwordCorrect) {
                const { _id, email, name } = foundUser
                const payload = { _id, email, name }

                const authToken = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { algorithm: 'HS256', expiresIn: '12h' }
                )
                res.status(200).json({ authToken })
            } else {
                res.status(401).json({ message: 'Unable to login' })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ message: 'Internal Server Error' })
        })

});

router.get('/verify', isAuthenticated, (req, res, next) => {
    // if  the token is valid we can access it on : req.payload
    res.status(200).json(req.paylod)

});

module.exports = router;