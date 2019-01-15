var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


mongoose.connect('mongodb://thomas:' + process.env.MONGO_DB_PASSWORD +  '@localhost/tergum');
// because apparently you need to do this
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

import {CONSTANTS} from './constants';


// User
var userSchema = new Schema({
    email: {
        type: String,
        required: [true, "No email provided."],
        index: {unique: true},
        match: [CONSTANTS.EMAIL_REGEX, "Please provide a valid email."],
        unique: true
    },
    password: { // a very salty password
        type: String,
        required: [true, "No password provided."]
    },
    profile: {
        type: Schema.Types.ObjectId, ref: 'Profile'
    },
    application: {
        type: Schema.Types.ObjectId, ref: 'Application'
    },
    user_state: {
        type: String,
        default: "profile"
    },
    password_reset_out: {
        type: Boolean,
        default: false
    }
});
userSchema.plugin(uniqueValidator);

var User = mongoose.model('User', userSchema);


// Profile
var profileSchema = new Schema({
    first_name: String,
    last_name: String,
    school: String,
    grade: {
        type: Number,
        max: [CONSTANTS.MAX_GRADE, "Only high school students may attend."]
    },
    phone_number: {
        type: String,
        match: [CONSTANTS.PHONE_REGEX, "Please enter a valid phone number."]
    },
    dietary_restrictions: String,
    shirt_size: {
        type: String,
        enum: {
            values: CONSTANTS.SHIRT_OPTIONS,
            message: "T shirt size must be one of the options."
        }
    },
    github_link: String,
    linkedin_profile: String,
    devpost_profile: String,
    personal_website: String,
    is_bgc: {
        type: Boolean,
        default: false
    },
    gender: String,
    race_ethnicity: String,
    mlh_agreement: {
        type: Boolean,
        default: false
    },
    mlh_data_agreement : {
        type: Boolean,
        default: false
    },
    is_menlo: {
        type: Boolean,
        default: false
    },
    is_complete: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
});

var Profile = mongoose.model('Profile', profileSchema);


// Application
var applicationSchema = new Schema({
    cool_project: String,
    last_summer: String,
    anything_else: String,
    liability_form: String,
    liability_form_valid: {
        type: Boolean,
        default: false
    },
    photo_form: String,
    photo_form_valid: {
        type: Boolean,
        default: false
    },
    is_admitted: {
        type: Boolean,
        default: false
    },
    is_waitlisted: {
        type: Boolean,
        default: false
    },
    is_rejected: {
        type: Boolean,
        default: false
    },
    is_ineligible: {
        type: Boolean,
        default: false
    },
    coming_yes: {
        type: Boolean,
        default: false
    },
    coming_maybe: {
        type: Boolean,
        default: false
    },
    coming_no: {
        type: Boolean,
        default: false
    },
    submitted: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
});

var Application = mongoose.model('Application', applicationSchema);


export {User}
export {Profile}
export {Application}