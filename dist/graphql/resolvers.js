'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolvers = undefined;

var _models = require('../models');

var _constants = require('../constants');

// const crypto = require('crypto');
// crypto.DEFAULT_ENCODING = 'latin1';
// src/resolvers.js
var password = require('password-hash-and-salt');
var jwt = require('jsonwebtoken');

var send = require('gmail-send')({
    user: 'noreply@menlohacks.com',
    from: 'MenloHacks',
    replyTo: "hello@menlohacks.com",
    pass: process.env.EMAIL_HOST_PASSWORD,
    subject: 'Reset your password'
});

function authenticate(token, fulfill, reject) {
    jwt.verify(token, process.env.TERGUM_SECRET_KEY, function (err, decoded) {
        if (!err) {
            _models.User.findOne({ email: decoded.email }).then(function (user) {
                if (user != null) {
                    fulfill(user);
                } else {
                    reject(decoded.email + " does not exist in our database.");
                }
            });
        } else {
            reject(err);
        }
    });
}

function createProfile(user) {
    return new Promise(function (fulfill, reject) {
        var profile = new _models.Profile();
        user.profile = profile._id;
        profile.user = user._id;
        if (user.email.includes("menloschool.org")) {
            profile.is_menlo = true;
            profile.school = "Menlo School";
        } else {
            profile.is_menlo = false;
        }
        profile.is_complete = false;
        profile.save(function (err, new_profile) {
            if (!err) {
                user.save(function (err) {
                    if (!err) {
                        fulfill(new_profile);
                    } else {
                        reject(err);
                    }
                });
            } else {
                reject(err);
            }
        });
    });
}

var resolvers = exports.resolvers = {
    Query: {
        user: function user(root, args) {
            return new Promise(function (fulfill, reject) {
                authenticate(args.token, function (user) {
                    if (new Date() > _constants.CONSTANTS.DECISIONS_RELEASED) {
                        if (user.user_state === "decision") {
                            fulfill(user);
                        } else {
                            _models.Profile.findById(user.profile).then(function (profile) {
                                if (!profile.is_bgc && !profile.is_menlo) {
                                    user.user_state = "decision";
                                    user.save(function (error) {
                                        if (!error) {
                                            fulfill(user);
                                        } else {
                                            reject(error);
                                        }
                                    });
                                } else {
                                    fulfill(user);
                                }
                            });
                        }
                    } else {
                        fulfill(user);
                    }
                }, reject);
            });
        },
        profile: function profile(root, args) {
            return new Promise(function (fulfill, reject) {
                authenticate(args.token, function (user) {
                    _models.Profile.findById(user.profile).then(function (profile) {
                        fulfill(profile);
                    });
                }, reject);
            });
        },
        application: function application(root, args) {
            return new Promise(function (fulfill, reject) {
                authenticate(args.token, function (user) {
                    _models.Application.findById(user.application).then(function (application) {
                        if (new Date() < _constants.CONSTANTS.DECISIONS_RELEASED && application) {
                            application.is_rejected = false;
                            application.is_waitlisted = false;
                            application.is_admitted = false;
                            application.is_ineligible = false;
                            fulfill(application);
                        } else {
                            fulfill(application);
                        }
                    });
                }, reject);
            });
        },
        CONSTANTS: function CONSTANTS(root, args) {
            return _constants.CONSTANTS;
        }
    },

    Mutation: {
        createUser: function createUser(root, args) {
            return new Promise(function (fulfill, reject) {
                if (new Date() < _constants.CONSTANTS.APPLICATIONS_CLOSE) {
                    _models.User.findOne({ email: args.email }).then(function (existing_user) {
                        console.log("value_of_existing_user");
                        if (existing_user == null) {
                            var user = new _models.User();
                            user.email = args.email;
                            password(args.password).hash(function (error, hash) {
                                if (!error) {
                                    user.password = hash;
                                    user.save(function (error) {
                                        if (!error) {
                                            jwt.sign({ email: args.email }, process.env.TERGUM_SECRET_KEY, { expiresIn: 86400 }, function (err, token) {
                                                if (!err) {
                                                    createProfile(user).then(function () {
                                                        fulfill(token);
                                                    }, function (err) {
                                                        reject(err);
                                                    });
                                                } else {
                                                    reject(err);
                                                }
                                            });
                                        } else {
                                            reject(error);
                                        }
                                    });
                                } else {
                                    reject(error);
                                }
                            });
                        } else {
                            reject(args.email + " already has an account.");
                        }
                    });
                } else {
                    reject("The registration deadline has passed.");
                }
            });
        },
        login: function login(root, args) {
            return new Promise(function (fulfill, reject) {

                _models.User.findOne({ email: args.email }).then(function (user) {
                    if (user != null) {
                        password(args.password).verifyAgainst(user.password, function (error, verified) {
                            if (!error) {
                                if (verified) {
                                    jwt.sign({ email: args.email }, process.env.TERGUM_SECRET_KEY, { expiresIn: 86400 }, function (err, token) {
                                        if (!err) {
                                            fulfill(token);
                                        } else {
                                            reject(err);
                                        }
                                    });
                                } else {
                                    reject("Your password is incorrect. Try again.");
                                }
                            } else {
                                reject(error);
                            }
                        });
                    } else {
                        reject(args.email + " does not exist in our database.");
                    }
                });
            });
        },
        send_reset: function send_reset(root, args) {
            return new Promise(function (fulfill, reject) {
                console.log("test1");
                _models.User.findOne({ email: args.email }).then(function (user) {
                    console.log("test2");
                    if (user != null) {
                        console.log("test3");
                        jwt.sign({ email: args.email }, process.env.TERGUM_SECRET_KEY, { expiresIn: 3600 }, function (err, token) {
                            console.log("test4");
                            if (!err) {
                                send({ // Overriding default parameters
                                    text: "Hi, recently you requested to reset your password for your MenloHacks account." + " You can do so at this link: https://apply.menlohacks.com?reset_password=" + token + " . " + "If you did not request a password change, you can safely ignore this email." + "Thank you," + "The MenloHacks Team",
                                    html: _constants.CONSTANTS.EMAIL_TEMPLATE_BEGINNING + "Hi,<br/>Recently you requested to " + "reset your password at for your MenloHacks account." + " You can do so <a href='https://apply.menlohacks.com?reset_password=" + token + "'>here</a>." + "<br/>If you did not request a password change, you can safely ignore this email." + "<br/>Thank you," + "<br/>The MenloHacks Team" + _constants.CONSTANTS.EMAIL_TEMPLATE_END,
                                    to: args.email
                                }, function (err, res) {
                                    console.log("test5");
                                    if (!err) {
                                        console.log("test6");
                                        user.password_reset_out = true;
                                        user.save(function (err) {
                                            if (!err) {
                                                fulfill(args.email);
                                            } else {
                                                reject(err);
                                            }
                                        });
                                    } else {
                                        reject(err);
                                    }
                                });
                            } else {
                                reject(err);
                            }
                        });
                    } else {
                        reject(args.email + " does not exist in our database.");
                    }
                });
            });
        },
        reset_password: function reset_password(root, args) {
            return new Promise(function (fulfill, reject) {
                authenticate(args.token, function (user) {
                    if (user.password_reset_out) {
                        password(args.new_password).hash(function (error, hash) {
                            if (!error) {
                                user.password = hash;
                                user.password_reset_out = false;
                                user.save(function (error) {
                                    if (!error) {
                                        fulfill(true);
                                    } else {
                                        reject(error);
                                    }
                                });
                            } else {
                                reject(error);
                            }
                        });
                    } else {
                        reject("Password reset not requested or already occurred.");
                    }
                }, reject);
            });
        },
        set_user_state: function set_user_state(root, args) {
            return new Promise(function (fulfill, reject) {
                authenticate(args.token, function (user) {
                    if (args.user_state === "profile") {
                        user.user_state = "profile";
                        user.save(function (err, new_profile) {
                            if (!err) {
                                fulfill("profile");
                            } else {
                                reject(err);
                            }
                        });
                    } else {
                        _models.Profile.findById(user.profile).then(function (profile) {
                            if (profile['is_complete']) {
                                var state_to_set = void 0;
                                if (profile.is_menlo) {
                                    state_to_set = "menlo_application";
                                } else if (profile.is_bgc) {
                                    state_to_set = "bgc_application";
                                } else {
                                    state_to_set = "application";
                                }
                                user.user_state = state_to_set;
                                if (!user.application) {
                                    var application = new _models.Application();
                                    user.application = application._id;
                                    application.user = user._id;
                                    application.save(function (err) {
                                        if (!err) {
                                            user.save(function (err) {
                                                if (!err) {
                                                    fulfill(state_to_set);
                                                } else {
                                                    reject(err);
                                                }
                                            });
                                        } else {
                                            reject(err);
                                        }
                                    });
                                } else {
                                    user.save(function (err) {
                                        if (!err) {
                                            fulfill(state_to_set);
                                        } else {
                                            reject(err);
                                        }
                                    });
                                }
                            } else {
                                reject("You must complete your profile before you can continue to your application.");
                            }
                        });
                    }
                });
            });
        },
        updateProfile: function updateProfile(root, args) {
            return new Promise(function (fulfill, reject) {
                authenticate(args.token, function (user) {

                    // delete args.token;
                    // For you future MenloHacks developer, I (Thomas) actually benchmarked the above statement:
                    // https://jsperf.com/if-vs-delete
                    // It seems that if you have more than ~7 arguments, you should be deleting before the loop and not
                    // bothering to check whether arg == "token"
                    // Profile has 12 fields that are actually updated directly. But I doubt that the mean number
                    // modified will be more than 7. So I stuck with the if.
                    _models.Profile.findById(user.profile).then(function (profile) {
                        var past_application_close = new Date() > _constants.CONSTANTS.APPLICATIONS_CLOSE;

                        for (var arg in args) {
                            if (args !== "token") {
                                if (!past_application_close || !_constants.CONSTANTS.DISABLED_AFTER_APPLICATIONS_CLOSE.includes(arg)) {
                                    profile[arg] = args[arg];
                                }
                            }
                        }
                        profile.is_menlo = profile.school === "Menlo School"; // This is why we need dropdowns.
                        profile.is_complete = true;
                        for (var i = 0; i < _constants.CONSTANTS.REQUIRED_PROFILE_FIELDS.length; i++) {
                            var field = _constants.CONSTANTS.REQUIRED_PROFILE_FIELDS[i];
                            if (profile[field] == null) {
                                profile.is_complete = false;
                                break;
                            }
                        }
                        profile.is_complete = profile.is_complete & profile.mlh_agreement & profile.mlh_data_agreement;
                        profile.save(function (err, new_profile) {
                            if (!err) {
                                fulfill(true);
                            } else {
                                reject(err);
                            }
                        });
                    });
                }, reject);
            });
        },
        updateApplication: function updateApplication(root, args) {
            return new Promise(function (fulfill, reject) {
                authenticate(args.token, function (user) {
                    if (user.email === "thomas@menlohacks.com") {
                        reject("goo.gl/aNCX3A");
                    } else if (user.profile != null) {
                        _models.Profile.findById(user.profile).then(function (profile) {
                            if (profile.is_complete) {
                                var past_application_close = new Date() > _constants.CONSTANTS.APPLICATIONS_CLOSE;
                                var past_decisions_released = new Date() > _constants.CONSTANTS.DECISIONS_RELEASED;
                                if (user.application != null) {
                                    _models.Application.findById(user.application).then(function (application) {
                                        for (var _arg in args) {
                                            if (_arg !== "token") {
                                                if (!past_application_close || !_constants.CONSTANTS.DISABLED_AFTER_APPLICATIONS_CLOSE.includes(_arg)) {
                                                    if (_arg === "coming_yes" || _arg === "coming_maybe" || _arg === "coming_no") {
                                                        if (past_decisions_released && application.is_admitted) {
                                                            application["coming_yes"] = false;
                                                            application["coming_maybe"] = false;
                                                            application["coming_no"] = false;
                                                            application[_arg] = args[_arg];
                                                        }
                                                    } else {
                                                        application[_arg] = args[_arg];
                                                    }
                                                }
                                            }
                                        }
                                        application.save(function (err, new_application) {
                                            if (!err) {
                                                fulfill(true);
                                            } else {
                                                reject(err);
                                            }
                                        });
                                    });
                                } else {
                                    if (!profile.is_menlo && !profile.is_bgc && past_decisions_released) {
                                        reject("You can no longer create a new application");
                                    } else {
                                        var application = new _models.Application();
                                        for (var arg in args) {
                                            if (arg !== "token") {
                                                if (!past_application_close || !_constants.CONSTANTS.DISABLED_AFTER_APPLICATIONS_CLOSE.contains(arg)) {
                                                    application[arg] = args[arg];
                                                }
                                            }
                                        }
                                        user.application = application._id;
                                        application.user = user._id;
                                        application.save(function (err, new_application) {
                                            if (!err) {
                                                user.save(function (err) {
                                                    if (!err) {
                                                        fulfill(true);
                                                    } else {
                                                        reject(err);
                                                    }
                                                });
                                            } else {
                                                reject(err);
                                            }
                                        });
                                    }
                                }
                            } else {
                                reject("You must complete the required parts of your profile before you can start an application.");
                            }
                        });
                    } else {
                        reject("You must make a profile before you can start an application.");
                    }
                }, reject);
            });
        }
    },

    User: {
        profile: function profile(root, args) {
            return new Promise(function (fulfill, reject) {
                if (root.profile != null) {
                    _models.Profile.findById(root.profile).then(function (profile) {
                        fulfill(profile);
                    });
                } else {
                    fulfill(null);
                }
            });
        },
        application: function application(root, args) {
            return new Promise(function (fulfill, reject) {
                if (root.application != null) {
                    _models.Application.findById(root.application).then(function (application) {
                        fulfill(application);
                    });
                } else {
                    fulfill(null);
                }
            });
        }
    },
    Constants: {
        PHONE_REGEX: function PHONE_REGEX(root, args) {
            return root.PHONE_REGEX.source;
        },
        EMAIL_REGEX: function EMAIL_REGEX(root, args) {
            return root.EMAIL_REGEX.source;
        },
        APPLICATIONS_CLOSE: function APPLICATIONS_CLOSE(root, args) {
            return root.APPLICATIONS_CLOSE.getTime();
        }
    }

};