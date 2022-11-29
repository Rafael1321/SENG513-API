const express = require("express");
const router = express.Router({ mergeParams: true });

// Controllers
const users = require("../controllers/users");

// prettier-ignore
router.route('/users/login')
      .post(users.loginUser);

module.exports = router;