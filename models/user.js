const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    id: {
        type: String,
        required : true,
        unique : true,
    },
    riotId: {
        type: String,
        required: true, 
        unique: true
    },
    name: {
        type: String,
        required: true, 
        unique: false
    },
    username: {
        type: String,
        required: true, 
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: false
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
    email: {
        type: String,
        required: true,
        unique: true,               
    }
});

module.exports = mongoose.model("User", UserSchema);