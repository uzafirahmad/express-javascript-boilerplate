const express = require("express");
const router = express.Router();

const { signupUser, loginUser, fetchUser } = require('../authentication/Views');

router.post("/register", async (req, res) => {
    signupUser(req,res);
});

router.post("/login", async (req, res) => {
    loginUser(req,res)
});

router.post("/test", fetchUser, async (req, res) => {
    let user=req.user
    console.log(user.email)
    res.send("inside auth api")
});

module.exports = router;
