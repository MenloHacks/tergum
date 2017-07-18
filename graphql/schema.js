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
    send_reset(email: String!): Boolean,
    
    # Resets the user's password based on the token from the reset password email. Returns True if successful.
    reset_password(email: String!, new_password: String!, token: String!): Boolean,
    
    # Updates or creates the user's profile. Returns that profile.
    updateProfile(
    name: String,
    school: String,
    grade: Int,
    zip_code: String,
    phone_number: String,
    gender: String,
    dietary_restrictions: [String],
    shirt_size: String,
    github_link: String,
    linkedin_profile: String,
    devpost_profile: String,
    personal_website: String,
    is_menlo: Boolean,
    is_complete: Boolean,
    token: String!
    ): Profile
    
    # Updates or creates the user's application. Returns that application. Cannot be done until Profile is_complete.
    updateApplication (
        cool_project: String,
        last_summer: String,
        anything_else: String,
        menlo_form_page_one: String,
        menlo_form_page_two: String,
        photo_form_page_one: String,
        photo_form_page_two: String,
        token: String!
    ): Application
}

# The base type for all users of the system. Usually not necessary to query directly.
type User {
    # The user's email address.
    email: String,
    # The user's profile.
    profile: Profile
    # The user's application. 
    application: Application, 
}

# The user's profile.
type Profile {
    # Full name. 
    name: String,
    # See SCHOOLS for a list of suggestions. New values should also be allowed.
    school: String,
    # See MAX_GRADE for the maximum grade allowed (12).
    grade: Int,
    # Must satisfy the ZIP_REGEX.
    zip_code: String,
    # Must satisfy the PHONE_REGEX.
    phone_number: String,
    # Must be one of the options from GENDER_OPTIONS.
    gender: String,
    # See DIETARY_RESTRICTIONS for a list of suggestions. New values should also be allowed. Multiple values should be
    # allowed. No dietary restrictions should be an empty list, not null.
    dietary_restrictions: [String],
    # Must be one of the options from SHIRT_OPTIONS
    shirt_size: String,
    github_link: String,
    linkedin_profile: String,
    devpost_profile: String,
    personal_website: String,
    # Whether the user goes to Menlo. Precalculated on the server so you don't have to. 
    is_menlo: Boolean
    # Whether the profile has all fields in REQUIRED_PROFILE_FIELDS filled out.
    is_complete: Boolean
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
    liability_form_page_one: String,
    # A url pointing to filestack.
    liability_form_page_two: String,
    # A url pointing to filestack.
    photo_form_page_one: String,
    # A url pointing to filestack.
    photo_form_page_two: String
}

type Constants {
    # The fields required to be filled out for a profile to be complete.
    REQUIRED_PROFILE_FIELDS: [String],
    # The maximum grade for any student attending.
    MAX_GRADE: Int,
    # A regex to verify zip codes.
    ZIP_REGEX: String,
    # A regex to verify phone numbers.
    PHONE_REGEX: String,
    # Options for gender. 
    GENDER_OPTIONS: [String],
    # Options for T shirt size.
    SHIRT_OPTIONS: [String],
    # Suggestions for schools.
    SCHOOLS: [String],
    # Suggestions for dietary restrictions
    DIETARY_RESTRICTIONS: [String],
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers});


export default schema;
