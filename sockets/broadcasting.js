const user = require("../models/user");
const matching = require("../models/matching");

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
                if(notPreviouslyMatchedWith(findMatchDTO.userId, userId2)){ // && satisfiesFilters(userId2);
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
            
            console.log(matchingQueue);
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

            console.log(matchingQueue);
        });

        /* CHAT */
        socket.on("send_msg" , (data) => {
            socket.broadcast.emit("receive_msg", data)
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

function satisfiesFilters(userId){

    const searchedUser = user.findOne({_id:userId}).exec();

    const regionMatched = searchedUser.region === filters.serverPreference;
    const playerTypeMatched = searchedUser.playerType === filters.gameMode;
    const rankMatched = (searchedUser.rank[0] >= filters.rankDisparity[0] && searchedUser.rank[1] >= filters.rankDisparity[1]) && 
                        (searchedUser.rank[0] <= filters.rankDisparity[2] && searchedUser.rank[1] <= filters.rankDisparity[3])
    const ageMatched = searchedUser.age >= filters.ageRange[0] && searchedUser.age <= filters.ageRange[1];
    const genderMatched = searchedUser.gender === -1?false:filters.genders[searchedUser.gender] 

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