import {
    makeExecutableSchema,
    addMockFunctionsToSchema,
} from 'graphql-tools';

import {resolvers} from './resolvers.js'

const typeDefs = `

type Query {
  # Queries for both profiles and applications should originate here. Otherwise, don't use it.
  user(token: String!): User,
  
  # Queries the user's profile.
  profile(token: String!): Profile,
  
  # Queries the user's application
  application(token: String!): Application,
  
  # Things like regex, dates, and field options will go here.
  CONSTANTS: Constants,
}

type Mutation {

    # Creates a new user in the database. Returns a token.
    createUser(email: String!, password: String!): String,
    
    # Logs in an existing user. Returns a token. To logout, simply purge the authentication key from the client.
    login(email: String!, password: String!): String,
    
    # Sends an email to the user with a token to reset their password. Returns True if successful.
    send_reset(email: String!): String,
    
    # Resets the user's password based on the token from the reset password email. Returns True if successful.
    reset_password(new_password: String!, token: String!): Boolean,
    
    set_user_state(user_state: String!, token: String!): String,
    
    # Updates or creates the user's profile. Returns that profile.
    updateProfile(
        first_name: String,
        last_name: String,
        school: String,
        grade: Int,
        phone_number: String,
        gender: String,
        race_ethnicity: String
        dietary_restrictions: String,
        shirt_size: String,
        github_link: String,
        linkedin_profile: String,
        devpost_profile: String,
        personal_website: String,
        is_bgc: Boolean,
        mlh_agreement: Boolean,
        mlh_data_agreement: Boolean,
        token: String!
    ): Boolean
    
    # Updates or creates the user's application. Returns that application. Cannot be done until Profile is_complete.
    updateApplication (
        cool_project: String,
        last_summer: String,
        anything_else: String,
        liability_form: String,
        photo_form: String,
        coming_yes: Boolean,
        coming_maybe: Boolean,
        coming_no: Boolean,
        submitted: Boolean,
        token: String!
    ): Boolean
}

# The base type for all users of the system. Usually not necessary to query directly.
type User {
    # The user's email address.
    email: String,
    # The user's profile.
    profile: Profile
    # The user's application
    application: Application,
    # The user's current state (application or profile)
    user_state: String
}

# The user's profile.
type Profile {
    first_name: String,
    last_name: String,
    # See SCHOOLS for a list of suggestions. New values should also be allowed.
    school: String,
    # See MAX_GRADE for the maximum grade allowed (12).
    grade: Int,
    # Must satisfy the PHONE_REGEX.
    phone_number: String,
    # See DIETARY_RESTRICTIONS for a list of suggestions. New values should also be allowed. Multiple values should be
    # allowed.
    dietary_restrictions: String,
    # Must be one of the options from SHIRT_OPTIONS
    shirt_size: String,
    github_link: String,
    linkedin_profile: String,
    devpost_profile: String,
    personal_website: String,
    # Whether the user is from the Boys and Girls Club.
    is_bgc: Boolean,
    # Whether the user agreed to the MLH checkbox.
    mlh_agreement: Boolean,
    mlh_data_agreement: Boolean,
    gender: String,
    race_ethnicity: String,
    # Whether the user goes to Menlo. Precalculated on the server so you don't have to. 
    is_menlo: Boolean,
    # Whether the profile has all fields in REQUIRED_PROFILE_FIELDS filled out.
    is_complete: Boolean,
}

# The user's application. Cannot exist until profile is_complete.
type Application {
    # A text field, only shown to non-Menlo students. I'm still thinking of the actual questions.
    cool_project: String,
    # A text field, only shown to non-Menlo students. I'm still thinking of the actual questions.
    last_summer: String,
    # A text field, shown to everyone.
    anything_else: String,
    # A url pointing to filestack.
    liability_form: String,
    # A url pointing to filestack.
    photo_form: String,
    is_admitted: Boolean,
    is_waitlisted: Boolean,
    is_rejected: Boolean,
    is_ineligible: Boolean,
    coming_yes: Boolean,
    coming_maybe: Boolean,
    coming_no: Boolean,
    submitted: Boolean
}

type Constants {
    # The fields required to be filled out for a profile to be complete.
    REQUIRED_PROFILE_FIELDS: [String],
    # The maximum grade for any student attending.
    MAX_GRADE: Int,
    # A regex to verify phone numbers.
    PHONE_REGEX: String,
    # A regex to identify emails.
    EMAIL_REGEX: String,
    # Options for gender. 
    GENDER_OPTIONS: [String],
    # Options for T shirt size.
    SHIRT_OPTIONS: [String],
    # Suggestions for schools.
    SCHOOLS: [String],
    # Suggestions for dietary restrictions
    DIETARY_RESTRICTIONS: [String],
    MENLO_FORM_URL: String,
    NON_MENLO_FORM_URL: String,
    PHOTO_FORM_URL: String,
    APPLICATIONS_CLOSE: String,
    DISABLED_AFTER_APPLICATIONS_CLOSE: [String],
    RACE_ETHNICITY_OPTIONS: [String]
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers});


export default schema;
