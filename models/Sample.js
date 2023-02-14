const mongoose = require('mongoose');
const ores = require('../config/ores');

const validateInteger = {
    validator: Number.isInteger,
    message: '{VALUE} is not an integer'
}

const schemaOres = {};
for (let [ore, name] of Object.entries(ores)) {
    schemaOres[ore] = {
        type: Number,
        min: 0,
        max: 6,
        validate: validateInteger
    };
}

const sampleSchema = mongoose.Schema({
    x: {
        type: Number,
        required: true,
        validate: validateInteger
    },
    y: {
        type: Number,
        required: true,
        validate: validateInteger
    },
    user: {type: String},
    ...schemaOres
}, {timestamps: true});

const Sample = mongoose.model('Sample', sampleSchema);

module.exports = Sample;