const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");

// @route    GET api/auth
// @desc     Test Routes
// @access   Public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    // console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// @route           POST api/auth
// @description     Authenticate user and get token
// @access          Public

router.post(
  "/",
  [
    check("email", "Plese include a valid email").isEmail(),
    check("password", "Password is required...").exists(),
  ],
  async (req, res) => {
    // console.log(req.data);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("check error in login post route");
      return res.status(400).json({ error: errors.array() });
    }

    // console.log(req.body);
    const { email, password } = req.body;

    try {
      //See if user Exists
      let user = await User.findOne({ email: email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //authenticate Password and email
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //return jsonWebToken
      const payload = {
        user: {
          id: user.id, //same as mongo Db _id , it get abstracted as id through mongoose
        },
      };

      //creating jwt token
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 }, ///when in production change this to 3600
        (err, token) => {
          if (err) throw err;
          // console.log({token});
          return res.json({ token });
        }
      );

      // res.send("User Registered");
    } catch (err) {
      // console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
