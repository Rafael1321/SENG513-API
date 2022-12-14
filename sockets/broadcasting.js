const user = require("../models/user");
const matching = require("../models/matching");
const filter = require("../models/filter");

// Used to keep track of who is connected and know their socket
const connectedUsers = new Map();
let matchingQueue = [];

function broadcasting(io){ // For connection and disconnection

    io.on("connection", (socket) => {

        socket.on('user_connected', (connectedUserId) => {
            
            if(!connectedUserId){
                socket.emit(`error_user_connected`, {msg:`Invalid connected user id ${connectedUserId}.`});
                return; 
            }
            
            // Add new connected user to Map
            if(!connectedUsers.has(connectedUserId)){
                connectedUsers.set(connectedUserId, {socket:socket});
                socket.emit(`success_user_connected`, {msg:`User with id ${connectedUserId} CONNECTED.`});
            }else{
                socket.emit(`error_user_connected`, {msg:`User with id ${connectedUserId} is already connected.`});
            }
        });

        /* MATCHING */

        socket.on('find_matching', async (findMatchDTO) => {
            
            // In case user id is invalid.
            if(!findMatchDTO.userId){
                socket.emit('error_find_matching',{msg:'User id is invalid.'});
                return;
            }
            if(!findMatchDTO.filters){
                socket.emit('error_find_matching', {msg:"Filters are invalid."});
                return;
            }

            // In case user id is not found
            if(!connectedUsers.has(findMatchDTO.userId)){
                socket.emit('error_find_matching', {msg:'User id does not exist.'});
                return;
            }

            socket.emit('success_find_matching', {msg:`User with id ${findMatchDTO.userId} ONLINE.`});

            // Attempting to find a match
            let matchFound = -1;
            const user1 = await user.findOne({_id:findMatchDTO.userId}).exec();
            for(let i = 0; i < matchingQueue.length; i++){
                let userId2 = matchingQueue[i];
                console.log("Not Previously Match: " + notPreviouslyMatchedWith(findMatchDTO.userId, userId2));
                console.log("Satisfied Filters: " + satisfiesFilters(user1, findMatchDTO.filters, userId2));
                
                if(notPreviouslyMatchedWith(findMatchDTO.userId, userId2) && satisfiesFilters(user1, findMatchDTO.filters, userId2) ){
                    matchFound = i;
                    break;
                }
            }

            if(matchFound !== -1){

                // Get matched user info 
                const user2 = await user.findOne({_id:matchingQueue[matchFound]}).exec();

                // Notify each user of the match and remove the matched user from queue
                socket.emit('match_found', {user:user2});
                connectedUsers.get(matchingQueue[matchFound]).socket.emit('match_found', {user:user1});
                
                // Store matching in the DB
                const newMatch = new matching({ 
                    firstUser: findMatchDTO.userId,
                    secondUser: matchingQueue[matchFound],
                });
                newMatch.save();
                
                // Remove matched user from queue 
                matchingQueue = immutableRemove(matchFound, matchingQueue);
            }else{
                // Add current user to the queue
                matchingQueue.push(findMatchDTO.userId);
            }     
        });

        socket.on('stop_matching', (userId) => {
            // In case user id is invalid.
            if(!userId){
                socket.emit('error_stop_matching',{msg:'User id is invalid.'});
                return;
            }

            // In case user id is not found
            if(!connectedUsers.has(userId)){
                socket.emit('error_stop_matching', {msg:'User id does not exist.'});
                return;
            }

            // Removing user from the matching queue
            matchingQueue = immutableRemove(matchingQueue.indexOf(userId), matchingQueue);

            socket.emit('success_stop_matching', {msg:`User with id ${userId} OFFLINE`});
        });

        /* CHAT */
        socket.on("send_msg" , (receiverId, msg) => { // msg = Text 

            if(!receiverId){
                socket.emit('error_send_msg', {msg:"Invalid receiver id."});
                return;
            }

            if(!connectedUsers.has(receiverId)){
                socket.emit('error_send_msg', {msg:"User wit that id is not online."})
                return;
            }

            connectedUsers.get(receiverId).socket.emit("receive_msg", {msg:msg});
        });

        /* DISCONNECT*/
        io.on("disconnect", (socket) => {
    
            const connectedUserId = getUserIdFromSocketId(socket.id);
            if(!connectedUserId) return; 
        
            // Remove user from map 
            if(connectedUsers.has(connectedUserId)){
                connectedUsers.delete(connectedUserId);
            }
        });
    });
}

/* HELPER FUNCTIONS */

function getUserIdFromSocketId(socketId){
    let userId = "";
    for (let [uId, info] of connectedUsers) {
        if(info.socket.id === socketId){
            userId = uId;
            break;
        }
    }
    return userId;
}

async function notPreviouslyMatchedWith(userId1, userId2){

    const match1 = await matching.find({ $and:[ {'firstUser':  userId1}, {'secondUser': userId2} ]}).exec();
    const match2 = await matching.find({ $and:[ {'firstUser':  userId2}, {'secondUser': userId1} ]}).exec();

    return !match1 && !match2;
}

async function satisfiesFilters(user1, user1Filters, user2Id){

    const user2 = await user.findOne({_id:user2Id}).exec();
    const user2Filters = await filter.findOne({userId:user2Id}).exec();

    // Region Matched
    const regionMatched = (user1.region === user2Filters.serverPreference) && (user2.region === user1Filters.serverPreference);
    
    // Game Mode Type
    const playerTypeMatched = (user1.playerType === user2Filters.gameMode) && (user2.playerType === user1Filters.gameMode);
    
    // Rank Macthed
    const rankMatchedUser1 = (user1.rank[0] >= user2Filters.rankDisparity[0] && user1.rank[1] >= user2Filters.rankDisparity[1]) && 
                             (user1.rank[0] <= user2Filters.rankDisparity[2] && user1.rank[1] <= user2Filters.rankDisparity[3]);
    const rankMatchedUser2 = (user2.rank[0] >= user1Filters.rankDisparity[0] && user2.rank[1] >= user1Filters.rankDisparity[1]) && 
                             (user2.rank[0] <= user1Filters.rankDisparity[2] && user2.rank[1] <= user1Filters.rankDisparity[3]);;
    const rankMatched = rankMatchedUser1 && rankMatchedUser2;
    
    // Age Matched
    const ageMatched = (user1.age >= user2Filters.ageRange[0] && user1.age <= user2Filters.ageRange[1]) && 
                       (user2.age >= user1Filters.ageRange[0] && user2.age <= user1Filters.ageRange[1]);
    
    // Gender Matched
    let genderMatched = false;
    if(user1.gender !== -1 && user2.gender !== -1){
        genderMatched = user2Filters[user1.gender] && user1Filters[user2.gender];
    }

    console.log("RegionMatched: " + regionMatched);
    console.log("PlayerTypeMatched: " + playerTypeMatched);
    console.log("RankMatched: " + rankMatched);
    console.log("AgeMatched: " + rankMatched);
    console.log("GenderMatched: " + rankMatched);
    console.log("===============================")

    return regionMatched && playerTypeMatched && rankMatched && ageMatched && genderMatched;
}

function immutableRemove(idx, array){
    
    if(idx < 0 || idx >= array.length) return array;
     
    newArray = [];
    for(let i = 0; i < array.length; i++){
        if(idx !== i) newArray.push(array[i]);
    }
    return newArray;
}

module.exports = { broadcasting };