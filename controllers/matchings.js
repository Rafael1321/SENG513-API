const { getOnlineUserIds } = require('../sockets/broadcasting')
const matching = require("../models/matching");
const _ = require('lodash');

module.exports.findMatch = async (req, res) => {

    try{
        const userId = res.params.userId;
        const filters = res.body;

        if(!filters) return res.type('json').status(400).send('Filters are required.');

        // Find online users
        const onlineUserIds = getOnlineUserIds();
        if(!onlineUserIds.length) res.type('json').status(404).send('Could not find a match. Try again later!');
        
        // Find user id's that have been matched with userId
        const matchedUserIds = [];
        const cursor = Person.find({ $or:[ {'firstUser': userId}, {'secondUser': userId} ]}).cursor();
        for (let match = await cursor.next(); match != null; match = await cursor.next()) {
            matchedUserIds.push(match.firstUser!== userId?match.firstUser:match.secondUser);
        }

        // Perform an difference of onlineUserIds and nonMatchedUserIds
        const userIdsIntersect = []
        for(let onlineUserId in onlineUserIds){
            if(!matchedUserIds.includes(onlineUserId)){
                userIdsIntersect.push(onlineUserId);
            }
        }
        if(!userIdsIntersect.length) res.type('json').status(404).send('Could not find a match. Try again later!'); 

        // Retrieve each user from database and apply filters
        let searchedUser = null;
        let userFound = false;
        for(let userId in userIdsIntersect){

            searchedUser = await user.findOne({_id:userId}).exec();

            const regionMatched = searchedUser.region === filters.serverPreference;
            const playerTypeMatched = searchedUser.playerType === filters.gameMode;
            const rankMatched = (searchedUser.rank[0] >= filters.rankDisparity[0] && searchedUser.rank[1] >= filters.rankDisparity[1]) && 
                                (searchedUser.rank[0] <= filters.rankDisparity[2] && searchedUser.rank[1] <= filters.rankDisparity[3])
            const ageMatched = searchedUser.age >= filters.ageRange[0] && searchedUser.age <= filters.ageRange[1];
            const genderMatched = searchedUser.gender === -1?false:filters.genders[searchedUser.gender] 

            if(regionMatched && playerTypeMatched && rankMatched && ageMatched && genderMatched){
                // Store match in the database
                const newMatch = new matching({ 
                    firstUser: userId,
                    secondUser: searchedUser._id,
                });
                await newMatch.save();
                userFound = true;
                break;
            }
        };

        if(!userFound){ // No user was found
            res.type('json').status(404).send('Could not find a match. Try again later!'); 
        }else{  
            res.type('json').status(200).send( _.pick(searchedUser, ['_id', 'riotId', 'displayName', 'gameName','tagLine', 'email', 'avatarImage', 'rank', 'accountLevel', 'region', 'age', 'gender', 'reputation', 'playerType', 'aboutMe']));  
        }
    }catch(err){
        return res.type('json').status(500).send(err.toString());
    }
}