// src/resolvers.js
import {User, Profile, Application} from '../models';
import {CONSTANTS} from '../constants'
// const crypto = require('crypto');
// crypto.DEFAULT_ENCODING = 'latin1';
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
    jwt.verify(token, process.env.TERGUM_SECRET_KEY, function(err, decoded) {
        if (!err) {
            User.findOne({email: decoded.email}).then(function (user) {
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
    return new Promise(function(fulfill, reject) {
        let profile = new Profile();
        user.profile = profile._id;
        profile.user = user._id;
        if (user.email.includes("menloschool.org")) {
            profile.is_menlo = true;
            profile.school = "Menlo School";
        } else {
            profile.is_menlo = false;
        }
        profile.is_complete = false;
        profile.save(function(err, new_profile) {
            if (!err) {
                user.save(function(err) {
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


export const resolvers = {
    Query: {
        user(root, args) {
            return new Promise(function (fulfill, reject){
                authenticate(args.token, function(user) {
                    if (new Date() > CONSTANTS.DECISIONS_RELEASED) {
                        if (user.user_state === "decision") {
                            fulfill(user);
                        } else {
                            Profile.findById(user.profile).then(function(profile) {
                                if (!profile.is_bgc && !profile.is_menlo) {
                                    user.user_state = "decision";
                                    user.save(function(error) {
                                        if (!error) {
                                            fulfill(user);
                                        }
                                        else {
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
        profile(root, args) {
            return new Promise(function (fulfill, reject){
                authenticate(args.token, function(user) {
                    Profile.findById(user.profile).then(function(profile) {
                        fulfill(profile);
                    });
                }, reject);
            });
        },
        application(root, args) {
            return new Promise(function (fulfill, reject){
                authenticate(args.token, function(user) {
                    Application.findById(user.application).then(function(application) {
                        if (new Date() < CONSTANTS.DECISIONS_RELEASED && application) {
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
        CONSTANTS(root, args) {
            return CONSTANTS;
        }

    },

    Mutation: {
        createUser(root, args) {
            return new Promise(function(fulfill, reject) {
                if (new Date() < CONSTANTS.APPLICATIONS_CLOSE) {
                    User.findOne({email: args.email}).then(function (existing_user) {
			console.log("value_of_existing_user"); 
			if (existing_user == null) {
                            var user = new User();
                            user.email = args.email;
                            password(args.password).hash(function(error, hash) {
                                if (!error) {
                                    user.password = hash;
                                    user.save(function(error) {
                                        if (!error) {
                                            jwt.sign({email: args.email}, process.env.TERGUM_SECRET_KEY,
                                                {expiresIn: 86400},
                                                function(err, token) {
                                                    if (!err) {
                                                        createProfile(user).then(function() {
                                                            fulfill(token);
                                                        }, function(err) {
                                                            reject(err);
                                                        })
                                                    } else {
                                                        reject(err);
                                                    }
                                                }
                                            );
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

        login(root, args) {
            return new Promise(function(fulfill, reject) {

                User.findOne({email: args.email}).then(function(user) {
                    if (user != null) {
                        password(args.password).verifyAgainst(user.password, function(error, verified) {
                            if (!error) {
                                if (verified) {
                                    jwt.sign({email: args.email}, process.env.TERGUM_SECRET_KEY,{expiresIn: 86400},
                                        function(err, token) {
                                            if (!err) {
                                                fulfill(token);
                                            } else {
                                                reject(err);
                                            }
                                        }
                                    );
                                } else {
                                    reject("Your password is incorrect. Try again.");
                                }
                            } else {
                                reject(error);
                            }
                        })
                    } else {
                        reject(args.email + " does not exist in our database.");
                    }
                })
            });
        },

        send_reset(root, args) {
            return new Promise(function (fulfill, reject) {
                console.log("test1");
                User.findOne({email: args.email}).then(function(user) {
                    console.log("test2");
                    if (user != null) {
                        console.log("test3");
                        jwt.sign({email: args.email}, process.env.TERGUM_SECRET_KEY, {expiresIn: 3600},
                            function(err, token) {
                                console.log("test4");
                                if (!err) {
                                    send({ // Overriding default parameters
                                        text: "Hi, recently you requested to reset your password for your MenloHacks account." +
                                        " You can do so at this link: https://apply.menlohacks.com?reset_password="
                                        + token + " . " +
                                        "If you did not request a password change, you can safely ignore this email." +
                                        "Thank you," +
                                        "The MenloHacks Team",
                                        html: CONSTANTS.EMAIL_TEMPLATE_BEGINNING + "Hi,<br/>Recently you requested to " +
                                        "reset your password at for your MenloHacks account." +
                                        " You can do so <a href='https://apply.menlohacks.com?reset_password=" + token + "'>here</a>." +
                                        "<br/>If you did not request a password change, you can safely ignore this email." +
                                        "<br/>Thank you," +
                                        "<br/>The MenloHacks Team" + CONSTANTS.EMAIL_TEMPLATE_END,
                                        to: args.email
                                    }, function (err, res) {
                                        console.log("test5");
                                        if (!err) {
                                            console.log("test6");
                                            user.password_reset_out = true;
                                            user.save(function(err) {
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
                            }
                        );
                    } else {
                        reject(args.email + " does not exist in our database.");
                    }
                });
            });
        },

        reset_password(root, args) {
            return new Promise(function (fulfill, reject) {
                authenticate(args.token, function(user) {
                    if (user.password_reset_out) {
                        password(args.new_password).hash(function(error, hash) {
                            if (!error) {
                                user.password = hash;
                                user.password_reset_out = false;
                                user.save(function(error) {
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

        set_user_state(root, args) {
            return new Promise(function(fulfill, reject) {
                authenticate(args.token, function(user) {
                    if (args.user_state === "profile") {
                        user.user_state = "profile";
                        user.save(function(err, new_profile) {
                            if (!err) {
                                fulfill("profile");
                            } else {
                                reject(err);
                            }
                        });
                    } else {
                        Profile.findById(user.profile).then(function(profile) {
                            if (profile['is_complete']) {
                                let state_to_set;
                                if (profile.is_menlo) {
                                    state_to_set = "menlo_application";
                                } else if (profile.is_bgc) {
                                    state_to_set = "bgc_application"
                                } else {
                                    state_to_set = "application"
                                }
                                user.user_state = state_to_set;
                                if (!user.application) {
                                    let application = new Application();
                                    user.application = application._id;
                                    application.user = user._id;
                                    application.save(function(err) {
                                        if (!err) {
                                            user.save(function(err) {
                                                if (!err) {
                                                    fulfill(state_to_set)
                                                } else {
                                                    reject(err);
                                                }
                                            });
                                        } else {
                                            reject(err);
                                        }
                                    });
                                } else {
                                    user.save(function(err) {
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
            })
        },

        updateProfile(root, args) {
            return new Promise(function(fulfill, reject) {
                authenticate(args.token, function(user) {

                    // delete args.token;
                    // For you future MenloHacks developer, I (Thomas) actually benchmarked the above statement:
                    // https://jsperf.com/if-vs-delete
                    // It seems that if you have more than ~7 arguments, you should be deleting before the loop and not
                    // bothering to check whether arg == "token"
                    // Profile has 12 fields that are actually updated directly. But I doubt that the mean number
                    // modified will be more than 7. So I stuck with the if.
                    Profile.findById(user.profile).then(function(profile) {
                        const past_application_close = new Date() > CONSTANTS.APPLICATIONS_CLOSE;

                        for (let arg in args) {
                            if (args !== "token") {
                                if (!past_application_close ||
                                    !CONSTANTS.DISABLED_AFTER_APPLICATIONS_CLOSE.includes(arg)) {
                                    profile[arg] = args[arg];
                                }
                            }
                        }
                        profile.is_menlo = profile.school === "Menlo School"; // This is why we need dropdowns.
                        profile.is_complete = true;
                        for (var i = 0; i < CONSTANTS.REQUIRED_PROFILE_FIELDS.length; i++) {
                            var field = CONSTANTS.REQUIRED_PROFILE_FIELDS[i];
                            if (profile[field] == null) {
                                profile.is_complete = false;
                                break;
                            }
                        }
                        profile.is_complete = profile.is_complete & profile.mlh_agreement & profile.mlh_data_agreement;
                        profile.save(function(err, new_profile) {
                            if (!err) {
                                fulfill(true);
                            } else {
                                reject(err);
                            }
                        });
                    })

                }, reject);
            });
        },

        updateApplication(root, args) {
            return new Promise(function(fulfill, reject) {
                authenticate(args.token, function(user) {
                    if (user.email === "thomas@menlohacks.com") {
                        reject("goo.gl/aNCX3A");
                    }
                    else if (user.profile != null) {
                        Profile.findById(user.profile).then(function(profile) {
                            if (profile.is_complete) {
                                const past_application_close = new Date() > CONSTANTS.APPLICATIONS_CLOSE;
                                const past_decisions_released = new Date() > CONSTANTS.DECISIONS_RELEASED;
                                if (user.application != null) {
                                    Application.findById(user.application).then(function(application) {
                                        for (let arg in args) {
                                            if (arg !== "token") {
                                                if (!past_application_close ||
                                                        !CONSTANTS.DISABLED_AFTER_APPLICATIONS_CLOSE.includes(arg)) {
                                                    if (arg === "coming_yes" || arg === "coming_maybe"
                                                        || arg === "coming_no") {
                                                        if (past_decisions_released && application.is_admitted) {
                                                            application["coming_yes"] = false;
                                                            application["coming_maybe"] = false;
                                                            application["coming_no"] = false;
                                                            application[arg] = args[arg];
                                                        }
                                                    } else {
                                                        application[arg] = args[arg];
                                                    }
                                                }
                                            }
                                        }
                                        application.save(function(err, new_application) {
                                            if (!err) {
                                                fulfill(true);
                                            } else {
                                                reject(err);
                                            }
                                        });
                                    })
                                } else {
                                    if (!profile.is_menlo && !profile.is_bgc && past_decisions_released) {
                                        reject("You can no longer create a new application");
                                    } else {
                                        var application = new Application();
                                        for (var arg in args) {
                                            if (arg !== "token") {
                                                if (!past_application_close ||
                                                    !CONSTANTS.DISABLED_AFTER_APPLICATIONS_CLOSE.contains(arg)) {
                                                    application[arg] = args[arg];
                                                }
                                            }
                                        }
                                        user.application = application._id;
                                        application.user = user._id;
                                        application.save(function(err, new_application) {
                                            if (!err) {
                                                user.save(function(err) {
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
                        reject("You must make a profile before you can start an application.")
                    }

                }, reject);
            });
        }
    },

    User: {
        profile(root, args) {
            return new Promise(function(fulfill, reject) {
                if (root.profile != null) {
                    Profile.findById(root.profile).then(function(profile) {
                        fulfill(profile);
                    });
                } else {
                    fulfill(null);
                }
            });
        },
        application(root, args) {
            return new Promise(function(fulfill, reject) {
                if (root.application != null) {
                    Application.findById(root.application).then(function(application) {
                        fulfill(application);
                    });
                } else {
                    fulfill(null);
                }
            });
        }
    },
    Constants: {
        PHONE_REGEX(root, args) {
            return root.PHONE_REGEX.source;
        },
        EMAIL_REGEX(root, args) {
            return root.EMAIL_REGEX.source;
        },
        APPLICATIONS_CLOSE(root, args) {
            return root.APPLICATIONS_CLOSE.getTime();
        }
    },


};
