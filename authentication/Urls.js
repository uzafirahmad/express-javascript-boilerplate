const express = require("express");
const router = express.Router();

const { signupUser, loginUser, fetchUser, getToken } = require('../authentication/Views');

//payload must have username, email, confirm password and password
router.post("/register", async (req, res) => {
    signupUser(req,res);
});

//payload must have email and password
router.post("/login", async (req, res) => {
    loginUser(req,res)
});

router.post("/test", fetchUser, async (req, res) => {
    let user=req.user
    console.log(user.email)
    res.send("inside auth api")
});

//payload must have refreshToken
router.post("/gettoken", async (req, res) => {
    getToken(req,res)
});

module.exports = router;
