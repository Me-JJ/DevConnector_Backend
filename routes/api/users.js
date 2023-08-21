const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

const User = require("../../models/User.js");

// @route           POST api/users
// @description     Register Users
// @access          Public

router.post(
  "/",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Plese include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // console.log("users->",req.body);
    const errors = validationResult(req);
    // console.log(errors);

    if (!errors.isEmpty()) {
      // console.log("check error");
      return res.status(400).json({ error: errors.array() });
    }

    // console.log("req->",req.body);
    const { name, email, password } = req.body;

    try {
      //See if user Exists
      let user = await User.findOne({ email: email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exits" }] });
      }
      //Get user gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      //encrypt Password

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
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
