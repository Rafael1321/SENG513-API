const express = require("express");
const router = express.Router({ mergeParams: true });

const matchings = require("../controllers/matchings");

router.route('/matchings/:userId')
      .post(matchings.findMatch);

module.exports = router;