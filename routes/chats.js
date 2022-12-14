const express = require("express");
const router = express.Router({ mergeParams: true });

const chats = require("../controllers/chats");

router.route('/chats')
      .post(chats.retrieveMessages);

router.route('/chats')
      .post(chats.saveMessage);

module.exports = router;