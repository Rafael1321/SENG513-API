const chats = require("../models/chat");
const _ = require('lodash');

module.exports.saveMessage = async (req, res) => {
    try{
        const {senderId, receiverId, message} = req.body;
       return res.type('json').status(200).send();
    }catch(err) {
        return res.type('json').status(500).send(err.toString());   
    }
};

module.exports.retrieveMessages = async (req, res) => {
    try{
        const {senderId, receiverId} = req.body;
        return res.type('json').status(200).send();
    }catch(err) {
        return res.type('json').status(500).send(err.toString());   
    }
}