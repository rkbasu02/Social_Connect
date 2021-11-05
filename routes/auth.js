const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../models/Users");
const auth = require("../middleware/auth");

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post(
  "/register",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Enter a valid email id").isEmail(),
    check("password", "Enter a valid password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already registered!" }] });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const jwtPayload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        jwtPayload,
        config.get("jwtSecret"),
        { expiresIn: 500000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error!");
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    check("email", "Enter a valid email id").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User does not exist" }] });
      }

      if (user) {
        const matching = await bcrypt.compare(password, user.password);
        if (!matching) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials" }] });
        }
        const jwtPayload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          jwtPayload,
          config.get("jwtSecret"),
          { expiresIn: 500000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error!");
    }
  }
);

// @route   GET api/auth
// @desc    Get current logged in user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("-password");
    res.json(currentUser);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
