const User = require("../authentication/Models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "298fhn98b87vh!@ERFE$G$%Rbrtrbh";

const fetchUser = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next()
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

const signupUser = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        // Check if both email and password are provided
        if (!email || !password) {
          return res
            .status(400)
            .json({ message: "Both email and password are required." });
        }
    
        // Check if a user with the provided email already exists
        if (await User.findOne({ email })) {
          return res
            .status(400)
            .json({ message: "User with this email already exists." });
        } else {
          const salt = await bcrypt.genSalt(10);
          const securepassword = await bcrypt.hash(password, salt);
          // Create a new user instance with the provided email and password
          await User.create({
            email: email,
            password: securepassword,
          });
    
          res.status(201).json({ message: "User created successfully" });
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating user" });
      }
};

const loginUser = async (req, res) => {
  // Change to POST method since you are creating a new user
  try {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Both email and password are required." });
    } else {
      let user = await User.findOne({email});
      if (user) {
        if (await bcrypt.compare(password, user.password)) {
          const payload = {
            user: {
              id: user.id,
              email: user.email,
            },
          };
          const accesstoken = jwt.sign(payload, JWT_SECRET);
          res.status(201).json({ accesstoken });
        } else {
          res.status(500).json({ message: "Error Logging In" });
        }
      } else {
        res.status(500).json({ message: "Error Logging In" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error Logging In" });
  }
};

module.exports = {
  loginUser,
  fetchUser,
  signupUser,
};
