const user = require("../models/user");

module.exports.loginUser = (req, res) => {

    try{
        const username = req.body.username;

        if(username == undefined || username === '' || username === null){
            return res.type('json').status(404).send({msg:'The username is missing'});   
        }
        if(password == undefined || password === '' || password === null){
            return res.type('json').status(404).send({msg:'The password is missing'});   
        }
    
        // Check if the username exists
        user.findOne({username:username}, (err, user) => {
            if (err) return res.type('json').status(404).send({msg:"Username was not found."});       
            else{
                // Check if the passwords match
                const isPasswordValid = bcrypt.compare(password, user.password);
                if(!isPasswordValid){
                    return res.type('json').status(404).send({msg:"The password is incorrect."});   
                }
            }
        });

        res.type('json').status(200).send(user);       
    
    }catch(err) {
        res.type('json').status(500).send();   
    }
};