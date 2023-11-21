const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const router = express.Router();
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleWare/fetchuser");

const JWT_SECRET = "ayushkaisheho$good";

// create a user using: post "/api/auth/login" and it does not require auth
router.post(
  "/createuser",

  [
    body("name", "enter a valid name").isLength({ min: 3 }),
    body("email", "enter a valid email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success=false;
    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    try {
      // checking whather the user's email already exist or not
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "sorry a user with this email already exist" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authtoken });
      // res.json(user);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server Error ");
    }
  }
);

//rout 2: Authenthication a user using post "./api/auth/login" no login requiredd

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", " Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success=false;
    // if there are error, return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({success, error: " please try to login with correct credentials" });
      }
    
      const passwordCompare =await bcrypt.compare(password, user.password);
      console.log(password)
      console.log(user.password)
      console.log(passwordCompare)
      if (!passwordCompare) {
        return res
          .status(400)
          .json({
            success,
            error: "please try to login with correct credentials",
          });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send(" Internal server Error ");
    }
  }
);

// router 3 : get loggedin user details is on post "/api/auth/getuser" . login require
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});
module.exports = router;
