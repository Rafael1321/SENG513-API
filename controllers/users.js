const bcrypt = require('bcrypt');
const user = require("../models/user");

module.exports.loginUser = (req, res) => {

    try{
        const {username, password} = req.body;

        if(username == undefined || username === '' || username === null){
            return res.type('json').status(404).send({msg:'The username is missing'});   
        }
        if(password == undefined || password === '' || password === null){
            return res.type('json').status(404).send({msg:'The password is missing'});   
        }
    
        // Check if the username exists
        var searchedUser = null;
        user.findOne({username:username}, (err, user) => { searchedUser = user; });

        if (searchedUser === null){             
            return res.type('json').status(404).send({msg:"User was not found."});  
        }else{
            // Check if the passwords match
            const isPasswordValid = bcrypt.compare(password, user.password);
            if(!isPasswordValid){
                return res.type('json').status(404).send({msg:"The password is incorrect."});   
            }
            return res.type('json').status(200).send({"data":user}); 
        }
       
    }catch(err) {
        return res.type('json').status(500).send({msg:err.toString()});   
    }
};