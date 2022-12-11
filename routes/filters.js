const express = require("express");
const router = express.Router({ mergeParams: true });

const filters = require("../controllers/filters");

router.route('/filters')
      .get(filters.retrieve);

router.route('/filters')
      .post(filters.upsert);

module.exports = router;