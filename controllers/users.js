const bcrypt = require('bcrypt');
const user = require("../models/user");
const _ = require('lodash');

module.exports.registerUser = async (req, res) => {
    try{
        const{displayName, email, password, tagLine, gameName} = req.body;
        
        // Validation of body variables
        if(email == undefined || email === '' || email === null) return res.type('json').status(404).send({msg:'The email is missing'});   
        if(password == undefined || password === '' || password === null) return res.type('json').status(404).send({msg:'The password is missing'});   
        
        let searchedUser = await user.findOne({email:email}).exec();
        if(searchedUser !== null) return res.type('json').status(400).send({msg:"Email already in use."});  

        // Getting user's RIOT ID
        const riotBaseUrl = process.env.RIOT_BASE_URL;
        const riotAPIKey = process.env.RIOT_API_KEY;
        const riotUrl = `${riotBaseUrl}${gameName}${tagLine}?api_key=${riotAPIKey}`
    
        const newUser = new user({ 
            riotId: (await fetch(riotUrl)).json().puuid, 
            displayName: displayName,
            email: email,
            password: await bcrypt.hash(password, await bcrypt.genSalt(10))
        });

        await newUser.save();

        return res.type('json').status(201).send({data: _.pick(newUser, ['_id', 'riotId', 'displayName', 'email', 'isAvatarSet', 'avatarImage'])});  

    }catch(err){
        return res.type('json').status(500).send({msg:err.toString()});   
    }
}

module.exports.loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        if(email == undefined || email === '' || email === null) return res.type('json').status(404).send({msg:'The username is missing'});   
        if(password == undefined || password === '' || password === null) return res.type('json').status(404).send({msg:'The password is missing'});   
        
        // Check if the username exists
        var searchedUser = await user.findOne({email:email}).select("+password").exec();
        
        if (searchedUser === null){             
            return res.type('json').status(404).send({msg:"User was not found."});  
        }else{
            // Check if the passwords match
            const isPasswordValid = await bcrypt.compare(password, searchedUser.password);
            if(!isPasswordValid){
                return res.type('json').status(404).send({msg:"The password is incorrect."});   
            }
            return res.type('json').status(200).send({"data":_.pick(searchedUser, ['_id', 'riotId', 'displayName', 'email', 'isAvatarSet', 'avatarImage'])}); 
        }
       
    }catch(err) {
        return res.type('json').status(500).send({msg:err.toString()});   
    }
};