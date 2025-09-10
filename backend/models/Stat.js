const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const statSchema = new Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        trim: true
    },
    appel: {
        type: Number,
        required: true,
        default: 0
    },
    jira: {
        type: Number,
        required: true,
        default: 0
    },
    mail: {
        type: Number,
        required: true,
        default: 0
    },
    escalade: {
        type: Number,
        required: true,
        default: 0
    },
    p1: {
        type: Number,
        required: true,
        default: 0
    },
    p2: {
        type: Number,
        required: true,
        default: 0
    },
    p3: {
        type: Number,
        required: true,
        default: 0
    },
    p4: {
        type: Number,
        required: true,
        default: 0
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Création des champs calculés (virtuals)
statSchema.virtual('total').get(function() {
    return this.appel + this.jira + this.mail;
});

statSchema.virtual('traite').get(function() {
    return this.p1 + this.p2 + this.p3 + this.p4;
});

statSchema.virtual('en_cours').get(function() {
    // Assure que les virtuals précédents sont calculés pour celui-ci
    const total = this.total;
    const traite = this.traite;
    return total - this.escalade - traite;
});

const N1Stat = mongoose.model('N1Stat', statSchema, 'N1stats');
const N2Stat = mongoose.model('N2Stat', statSchema, 'N2stats');

module.exports = { N1Stat, N2Stat };