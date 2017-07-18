var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

mongoose.connect('mongodb://localhost/tergum');
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
        unique: true
    },
    password: { // a very salty password
        type: String,
        required: [true, "No password provided."]
    },
    profile: {
        type: String

    },
    application: {
        type: String
    }
});
userSchema.plugin(uniqueValidator);

var User = mongoose.model('User', userSchema);


// Profile
var profileSchema = new Schema({
    name: String,
    school: String,
    grade: {
        type: Number,
        max: [CONSTANTS.MAX_GRADE, "Only high school students may attend."]
    },
    zip_code: {
        type: String,
        match: [CONSTANTS.ZIP_REGEX, "Zip codes must be five digits."]
    },
    phone_number: {
        type: String,
        match: [CONSTANTS.PHONE_REGEX, "Please enter a valid phone number."]
    },
    gender: {
        type: String,
        enum: {
            values: CONSTANTS.GENDER_OPTIONS,
            message: "Gender must be one of the options."
        }
    },
    dietary_restrictions: Array,
    shirt_size: {
        type: String,
        enum: {
            values: CONSTANTS.TSHIRT_OPTIONS,
            message: "T shirt size must be one of the options."
        }
    },
    github_link: String,
    linkedin_profile: String,
    devpost_profile: String,
    personal_website: String,
    is_menlo: {
        type: Boolean,
        default: false
    },
    is_complete: {
        type: Boolean,
        default: false
    }
});

var Profile = mongoose.model('Profile', profileSchema);


// Application
var applicationSchema = new Schema({
    cool_project: String,
    last_summer: String,
    anything_else: String,
    menlo_form_page_one: String,
    menlo_form_page_two: String,
    photo_form_page_one: String,
    photo_form_page_two: String
});

var Application = mongoose.model('Application', applicationSchema);


export {User}
export {Profile}
export {Application}