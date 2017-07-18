// src/resolvers.js
import {User, Profile, Application} from '../models';
import {CONSTANTS} from '../constants'
var password = require('password-hash-and-salt');
var jwt = require('jsonwebtoken');

var send = require('gmail-send')({
    user: 'noreply@menlohacks.com',
    pass: process.env.EMAIL_HOST_PASSWORD,
    subject: 'reset password'
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


export const resolvers = {
    Query: {
        user(root, args) {
            return new Promise(function (fulfill, reject){
                authenticate(args.token, function(user) {
                    fulfill(user)
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
                        fulfill(application);
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
                User.findOne({email: args.email}).then(function (existing_user) {
                    if (existing_user == null) {
                        var user = new User();
                        user.email = args.email;
                        password(args.password).hash(function(error, hash) {
                            if (!error) {
                                user.password = hash;
                                user.save(function(error) {
                                    if (!error) {
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
                User.findOne({email: args.email}).then(function(user) {
                    if (user != null) {
                        jwt.sign({email: args.email}, process.env.TERGUM_SECRET_KEY, {expiresIn: 3600},
                            function(err, token) {
                                if (!err) {
                                    send({ // Overriding default parameters
                                        text: token,
                                        to: args.email
                                    }, function (err, res) {
                                        if (!err) {
                                            fulfill(true);
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
                    password(args.new_password).hash(function(error, hash) {
                        if (!error) {
                            user.password = hash;
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
                }, reject);
            });
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
                    if (user.profile != null) {
                        //This is an annoying split that improves efficiency. But it really does not improve code length...
                        Profile.findById(user.profile).then(function(profile) {
                            for (var arg in args) {
                                if (arg != "token") {
                                    profile[arg] = args[arg];
                                }
                            }
                            profile.is_menlo = profile.school == "Menlo School"; // This is why we need dropdowns.
                            profile.is_complete = true;
                            for (var i = 0; i < CONSTANTS.REQUIRED_PROFILE_FIELDS.length; i++) {
                                var field = CONSTANTS.REQUIRED_PROFILE_FIELDS[i];
                                if (profile[field] == null) {
                                    profile.is_complete = false;
                                    break;
                                }
                            }
                            profile.save(function(err, new_profile) {
                                if (!err) {
                                    fulfill(new_profile);
                                } else {
                                    reject(err);
                                }
                            });
                        })
                    } else {
                        var profile = new Profile();
                        for (var arg in args) {
                            if (arg != "token") {
                                profile[arg] = args[arg];
                            }
                        }
                        user.profile = profile._id;
                        profile.is_menlo = profile.school == "Menlo School"; // This is why we need dropdowns.
                        profile.is_complete = true;
                        for (var i = 0; i < CONSTANTS.REQUIRED_PROFILE_FIELDS.length; i++) {
                            var field = CONSTANTS.REQUIRED_PROFILE_FIELDS[i];
                            if (profile[field] == null) {
                                profile.is_complete = false;
                                break;
                            }
                        }
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
                    }

                }, reject);
            });
        },

        updateApplication(root, args) {
            return new Promise(function(fulfill, reject) {
                authenticate(args.token, function(user) {
                    if (user.profile != null) {
                        Profile.findById(user.profile).then(function(profile) {
                            if (profile.is_complete) {
                                if (user.application != null) {
                                    Application.findById(user.application).then(function(application) {
                                        for (var arg in args) {
                                            if (arg != "token") {
                                                application[arg] = args[arg];
                                            }
                                        }
                                        application.save(function(err, new_application) {
                                            if (!err) {
                                                fulfill(new_application);
                                            } else {
                                                reject(err);
                                            }
                                        });
                                    })
                                } else {
                                    var application = new Application();
                                    for (var arg in args) {
                                        if (arg != "token") {
                                            application[arg] = args[arg];
                                        }
                                    }
                                    user.application = application._id;
                                    application.save(function(err, new_application) {
                                        if (!err) {
                                            user.save(function(err) {
                                                if (!err) {
                                                    fulfill(new_application);
                                                } else {
                                                    reject(err);
                                                }
                                            });
                                        } else {
                                            reject(err);
                                        }
                                    });
                                }
                            } else {
                                reject("You must complete the required parts of your profile before you can start an application");
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
    }

};