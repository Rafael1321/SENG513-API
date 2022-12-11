
// Used to keep track of who is connected and know their socket
const connectedUsers = new Map();

function broadcasting(io){ // For connection and disconnection

    io.on("connection", (socket) => {

        const connectedUserId = socket.handshake.query['userId'];
        if(!connectedUserId) return; 
    
        // Add new connected user to Map
        if(!connectedUsers.has(connectedUserId)){
            connectedUsers.set(connectedUserId, {socket:socket, online:false});
        }
    
        /* MATCHING */

        socket.on('find_matching', (userId) => {
 
            // In case user id is invalid.
            if(!user){
                socket.emit('error_find_matching','User id is invalid.');
                return;
            }

            // In case user id is not found
            if(!connectedUsers.has(userId)){
                socket.emit('error_find_matching', 'User id does not exist.');
                return;
            }

            // Set the user as "online"
            connectedUsers.set(userId, {...connectedUsers.get(userId), online:true});

            socket.emit('success_find_matching');
        });

        socket.on('stop_matching', (userId) => {
            // In case user id is invalid.
            if(!user){
                socket.emit('error_stop_matching','User id is invalid.');
                return;
            }

            // In case user id is not found
            if(!connectedUsers.has(userId)){
                socket.emit('error_stop_matching', 'User id does not exist.');
                return;
            }

            // Set the user as "offline"
            connectedUsers.set(userId, {...connectedUsers.get(userId), online:false});

            socket.emit('success_stop_matching');
        });

        socket.on('match_found', (myId, matchedWithId) => {

            // Invalid matched with id.
            let invalid = true;
            if(!matchedWithId){
                socket.emit('error_match_found', 'Matched with id is invalid.')
            }else if(!connectedUsers.has(matchedWithId)){ // In case matched with id is not found
                socket.emit('error_match_found', 'Matched with id does not exist.');
            }else if(!connectedUsers.get(matchedWithId).online){
                socket.emit('error_match_found', 'Matched with id belong to an OFFLINE user.');
            }else{
                invalid = false;
            }

            if(invalid) return;

            connectedUsers.get(matchedWithId).socket.emit('match_found', myId);

            socket.emit('success_match_found');
        });

        /* CHAT */
        
        /* DISCONNECT*/
        io.on("disconnect", (socket) => {
    
            const connectedUserId = socket.handshake.query['userId'];
            if(!connectedUserId) return; 
        
            // Remove user from map 
            if(connectedUsers.has(connectedUserId)){
                connectedUsers.delete(connectedUserId);
            }
        });
    });
}

module.exports = { broadcasting };