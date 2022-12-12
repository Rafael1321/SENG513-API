
// Used to keep track of who is connected and know their socket
const connectedUsers = new Map();

function broadcasting(io){ // For connection and disconnection

    io.on("connection", (socket) => {

        socket.on('user_connected', (connectedUserId) => {
            
            if(!connectedUserId){
                socket.emit(`error_user_connected`, {msg:`Invalid connected user id ${connectedUserId}.`});
                return; 
            }
            
            // Add new connected user to Map
            if(!connectedUsers.has(connectedUserId)){
                connectedUsers.set(connectedUserId, {socket:socket, online:false});
                socket.emit(`success_user_connected`, {msg:`User with id ${connectedUserId} is set as connected.`});
            }else{
                socket.emit(`error_user_connected`, {msg:`User with id ${connectedUserId} is already connected.`});
            }
        });

        /* MATCHING */

        socket.on('find_matching', (userId) => {
            
            // In case user id is invalid.
            if(!userId){
                socket.emit('error_find_matching',{msg:'User id is invalid.'});
                return;
            }

            // In case user id is not found
            if(!connectedUsers.has(userId)){
                socket.emit('error_find_matching', {msg:'User id does not exist.'});
                return;
            }

            // Set the user as "online"
            connectedUsers.set(userId, {...connectedUsers.get(userId), online:true});

            socket.emit('success_find_matching', {msg:'User succesfully marked as online.'});
        });

        socket.on('stop_matching', (userId) => {
            // In case user id is invalid.
            if(!user){
                socket.emit('error_stop_matching',{msg:'User id is invalid.'});
                return;
            }

            // In case user id is not found
            if(!connectedUsers.has(userId)){
                socket.emit('error_stop_matching', {msg:'User id does not exist.'});
                return;
            }

            // Set the user as "offline"
            connectedUsers.set(userId, {...connectedUsers.get(userId), online:false});

            socket.emit('success_stop_matching', {msg:'User succesfully marked as offline.'});
        });

        socket.on('match_found', (myId, matchedWithId) => {

            // Invalid matched with id.
            let invalid = true;
            if(!matchedWithId){
                socket.emit('error_match_found', {msg:'Matched with id is invalid.'})
            }else if(!connectedUsers.has(matchedWithId)){ // In case matched with id is not found
                socket.emit('error_match_found', {msg:'Matched with id does not exist.'});
            }else if(!connectedUsers.get(matchedWithId).online){ // In case taht user is offline
                socket.emit('error_match_found', {msg:'Matched with id belong to an OFFLINE user.'});
            }else{
                invalid = false;
            }

            if(invalid) return;

            connectedUsers.get(matchedWithId).socket.emit('match_found', {matchedWithId:myId});

            socket.emit('success_match_found');
        });

        /* CHAT */
        
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

function getOnlineUserIds(){
    const onlineUsers = [];
    for (let [userId, info] of connectedUsers) {
        if(info.online) onlineUsers.push(userId);
    }
    return onlineUsers;
}

module.exports = { broadcasting, getOnlineUserIds };