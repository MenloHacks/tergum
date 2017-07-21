var fs = require('fs');
var path = require('path');
const CONSTANTS = {
    REQUIRED_PROFILE_FIELDS : [
        "name",
        "school",
        "grade",
        "zip_code",
        "phone_number",
        "gender",
        "dietary_restrictions",
        "shirt_size"
    ],
    MAX_GRADE: 12,
    ZIP_REGEX: /^\d{5}$/,
    PHONE_REGEX: /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})$/,
    GENDER_OPTIONS: [
        "male",
        "female",
        "other",
        "prefer not to say"
    ],
    SHIRT_OPTIONS: [
        "XS",
        "S",
        "M",
        "L",
        "XL"
    ],
    SCHOOLS: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'school_names.json'), 'utf8')),
    DIETARY_RESTRICTIONS: [
        "none",
        "vegetarian",
        "vegan",
        "gluten free",
        "nut allergy"
    ]
    
};

export {CONSTANTS};