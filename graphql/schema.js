import {
    makeExecutableSchema,
    addMockFunctionsToSchema,
} from 'graphql-tools';

import {resolvers} from './resolvers.js'

const typeDefs = `

type Query {
  user(token: String!): User,
  
  profile(token: String!): Profile,
  
  application(token: String!): Application,
  
  CONSTANTS: Constants,
}

type Mutation {
    createUser(email: String!, password: String!): Boolean,
    
    login(email: String!, password: String!): String,
    
    send_reset(email: String!): Boolean,
    
    reset_password(email: String!, new_password: String!, token: String!): Boolean,
    
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
    complete: Boolean,
    token: String!
    ): Profile
    
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

type User {
    email: String,
    application: Application, 
    profile: Profile
}
type Profile {
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
    is_menlo: Boolean
    is_complete: Boolean
}
type Application {
    cool_project: String,
    last_summer: String,
    anything_else: String,
    menlo_form_page_one: String,
    menlo_form_page_two: String,
    photo_form_page_one: String,
    photo_form_page_two: String
}

type Constants {
    REQUIRED_PROFILE_FIELDS: [String],
    MAX_GRADE: Int,
    ZIP_REGEX: String,
    PHONE_REGEX: String,
    GENDER_OPTIONS: [String],
    TSHIRT_OPTIONS: [String],
    SCHOOLS: [String]
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers});


export default schema;
