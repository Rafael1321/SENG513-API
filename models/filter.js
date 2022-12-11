const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FiltersSchema = new Schema({
    serverPreference: {
        type: Number,
        required: false,
        unique: false,
        default: 0 // na
    },
    gameMode: {
        type: Number,
        required: false,
        unique: false,
        default: 1 // casual
    },
    rankDisparity:{
        type: Array,
        required: false,
        unique: false,
        default: [1, 9]
    },
    ageRange:{
        type: Array,
        required: false,
        unique: false,
        default: [18, 25]
    },
    genders: {
        type: Number,
        required: false,
        unique: false,
        default: 0
    }
});

module.exports = mongoose.model("Filters", FiltersSchema);