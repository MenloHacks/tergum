var fs = require('fs');
var path = require('path');
const CONSTANTS = {
    REQUIRED_PROFILE_FIELDS : [
        "first_name",
        "last_name",
        "school",
        "grade",
        "phone_number",
        "gender",
        "race_ethnicity",
        "shirt_size",
    ],
    MAX_GRADE: 12,
    ZIP_REGEX: /^\d{5}(-\d{4})?$/,
    PHONE_REGEX: /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})$/,
    GENDER_OPTIONS: [
        "Male",
        "Female",
        "prefer not to say"
    ],
    SHIRT_OPTIONS: [
        "S",
        "M",
        "L",
        "XL"
    ],
    SCHOOLS: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'school_names.json'), 'utf8')),
    DIETARY_RESTRICTIONS: [
        "vegetarian",
        "vegan",
        "gluten free",
        "nut allergy"
    ],
    RACE_ETHNICITY_OPTIONS: [
        "American Indian or Alaskan Native",
        "Asian / Pacific Islander",
        "Black or African American",
        "Hispanic",
        "White / Caucasian",
        "Prefer not to answer"
    ],
    EMAIL_REGEX: /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
    MENLO_FORM_URL: 'https://d2lv6xypat6og6.cloudfront.net/menlo-liability.pdf',
    NON_MENLO_FORM_URL: 'https://d2lv6xypat6og6.cloudfront.net/non-menlo-liability.pdf',
    PHOTO_FORM_URL: 'https://d2b6s0dsvfyqsi.cloudfront.net/photo_release.pdf',
    APPLICATIONS_CLOSE: new Date(2019, 1, 16, 0, 0, 0, 0),
    DISABLED_AFTER_APPLICATIONS_CLOSE: ["cool_project", "last_summer", "school", "is_bgc"],
    DECISIONS_RELEASED: new Date(2019, 1, 15, 0, 0, 0, 0),
    EMAIL_TEMPLATE_BEGINNING: fs.readFileSync(path.join(__dirname, '..', 'email_template_beginning.html'), 'utf8'),
    EMAIL_TEMPLATE_END: fs.readFileSync(path.join(__dirname, '..', 'email_template_end.html'), 'utf8')

    
};
console.log(CONSTANTS.SCHOOLS);

export {CONSTANTS};