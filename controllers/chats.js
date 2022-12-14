const chats = require("../models/chat");
const _ = require('lodash');

module.exports.saveMessage = async (req, res) => {
    try{
        const {senderId, receiverId, message} = req.body;

        if(!senderId)    return res.type('json').status(400).send("Sender id was not provided.");
        if(!receiverId)  return res.type('json').status(400).send("Receiver id was not provided.");
        if(!message)     return res.type('json').status(400).send("Message was not provided");

        const newChat = new chats({ 
            senderId:senderId,
            receiverId:receiverId,
            message:message
        });

        await newChat.save();

        return res.type('json').status(201).send(newChat);

    }catch(err) {
        return res.type('json').status(500).send(err.toString());   
    }
};

module.exports.retrieveMessages = async (req, res) => {
    try{
        const {senderId, receiverId} = req.body;
        
        if(!senderId)   return res.type('json').status(400).send("Sender id was not provided.");
        if(!receiverId) return res.type('json').status(400).send("Receiver id was not provided.");

        await chats.find({$or : [{}]})


        // sender is userId

        // senderId : string, 
        // receiverId : string,
        // message: string; 





    }catch(err) {
        return res.type('json').status(500).send(err.toString());   
    }
}