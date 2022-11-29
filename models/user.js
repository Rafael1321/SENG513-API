const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    riotId: {
        type: String,
        required: false, 
        unique: false
    },
    displayName: {
        type: String,
        required: true, 
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: true,               
    },
    password: {
        type: String,
        required: true,
        unique: false,
        select: false
    },
    isAvatarSet: {
        type: Boolean,
        required: false,
        unique: false,
        default: false
    },
    avatarImage: {
        type: String,
        required: false,
        unique: false,
        default: ""
    },
});

module.exports = mongoose.model("User", UserSchema);