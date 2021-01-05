const db = require("../models");
const config = require("../config/auth.config");

const fetch = require('node-fetch');
const User = db.user;
const Role = db.role;
const Chat = db.chat;
const WorkAreaNotes = db.workareanotes;
const Chat_schedule = db.chat_schedule;
const RoomParticipant = db.roomparticipant;
const Bible = db.bible;
const Country = db.country;
const State = db.state;
const City = db.city;
const File = db.file;
const Op = db.Sequelize.Op;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var EmailService = require('../utility/EmailService');
var MailMessage = require('../utility/MailMessage');
var EmailBuilder = require('../utility/EmailBuilder');
var async = require('async');
const { chat, state, roomparticipant, bible } = require("../models");
const fs = require('fs')
const cheerio = require('cheerio');


// Save User to Database
exports.signup = (req, res) => {
    const date = new Date().toISOString().
        replace(/T/, '').
        replace(/\..+/, '');

    const uid = ((req.body.username).slice(0, 3)) + date
    console.log(date);
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        phone_no: req.body.phone_no,
        last_name: req.body.last_name,
        gender: req.body.gender,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        yob: req.body.yob,
        time_zone: req.body.time_zone,
        church_name: req.body.church_name,
        paster_name: req.body.paster_name,
        church_city: req.body.church_city,
        church_state: req.body.church_state,
        id_is_Active: 1,
        restricted: 0,
        created_by: req.body.created_by,
        modify_by: req.body.modify_by,
        u_id: uid
    })
        .then(user => {
            if (req.body.roles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles
                        }
                    }
                }).then(roles => {
                    user.setRoles(roles).then(() => {
                        res.send({ message: "User registered successfully!" });
                    });
                });
            } else {
                // user role = 1
                user.setRoles([2]).then(() => {
                    res.send({ message: "User registered successfully!" });
                    var m = {
                        email: user.email,
                        password: user.password,
                        first_name: user.first_name,
                        last_name: user.last_name
                    };

                    var msg = EmailBuilder.getSignUpMessage(m);
                    msg.to = req.body.email;

                    var ser = new EmailService()
                    ser.sendEmail(msg, function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
            }
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

// user login api
exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
        .then(user => {
            if (user.restricted == 0) {

                if (!user) {
                    return res.status(404).send({ message: "User Not found." });
                }

                var passwordIsValid = bcrypt.compareSync(
                    req.body.password,
                    user.password
                );

                if (!passwordIsValid) {
                    return res.status(401).send({
                        accessToken: null,
                        message: "Invalid Password!"
                    });
                }
            } else {
                res.send("user not authorized to access")
            }
            //jwt token
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            var role_id = [];
            user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {

                    role_id.push(roles[i].id);
                }
                res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    roles: role_id,
                    accessToken: token,

                });
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

//search user by username
exports.search = (req, res) => {
    if (req.body.username == "" || req.body.username == null) {
        res.send("no record");
    } else {
        User.findAll({
            where: {
                username: {
                    [Op.like]: '%' + req.body.username + '%'
                }
            }
        })
            .then(user => {
                console.log(user);
                if (user.length == 0) {
                    return res.send({ message: "User Not found." });
                }
                res.json({
                    data: user.map(function (v) {
                        return {
                            user: v.username
                        }
                    })
                })
            });
    }
};
// update record using username
exports.update = (req, res) => {
    const username = req.body.username;
    User.update(req.body, {
        where: { username: username }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "User was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update User with id=${username}. Maybe User was not found or req.body is empty!`
                });
            }
        }).catch(err => {
            res.status(500).send({
                message: "Error updating username with id=" + username
            });
        });

}
//chat hittory create
exports.chat_history = (req, res) => {
    Chat.create({
        chat_id: req.body.chat_id,
        sender_id: req.body.sender_id,
        message: req.body.message,
        date_time: req.body.date_time,
        status: req.body.status,
        ROOM_ID: req.body.ROOM_ID_FK,
        SENDER_TYPE: req.body.SENDER_TYPE
    })
        .then(chat => {

            console.log(chat);
            res.send({
                result: 1,
                message: "User registered successfully!"
            });

        });

};
exports.getworkareanotes = (req, res) => {
    WorkAreaNotes.findAll()
        .then(workareanotes => {

            res.json(workareanotes)
        });
}

exports.deleteworkareanotes = (req, res) => {
    const id = req.param("id");
    WorkAreaNotes.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Work area note  was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Work area note with id=${id}. Maybe  was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Work area note with id=" + id
            });
        });
};
exports.updateworkareanote = (req, res) => {
    const id = req.params.id;

    WorkAreaNotes.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Work area note was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Work area note with id=${id}. Maybe Work area note was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Work area note with id=" + id
            });
        });
};

exports.workareanote = (req, res) => {
    WorkAreaNotes.create({
        Notes: req.body.Notes,
        UserName: req.body.UserName,
        Date_Time: req.body.Date_Time,
        father_id: req.body.father_id
    })
        .then(workareanotes => {
            console.log(workareanotes);
            res.send({
                result: 1,
                message: "User registered successfully!",
                workareanotes
            });

        });
};

//room participent

exports.room_participant = (req, res) => {
    var roomfk;
    var userfk = req.body.USER_ID
    roomfk = req.body.ROOM_ID

    RoomParticipant.create({
        RnP_ID: req.body.RnP_ID,
        USER_ID: userfk,
        USER_NAME: req.body.USER_NAME,
        ROOM_ID: roomfk,
        PASTOR_ID: req.body.PASTOR_ID,
        CHAT_STATUS: req.body.CHAT_STATUS,
        CHAT_COMMENT: req.body.CHAT_COMMENT,
        LAST_MESSAGE: req.bod.LAST_MESSAGE
    }).then()
    Chat.create({
        ROOM_ID_FK: roomfk,
        sender_id: userfk,
        SENDER_TYPE: userfk
    }).then()
    RoomParticipant.findOne({
        where: {
            ROOM_ID: req.body.ROOM_ID
        }
    })

        .then(roomparticipant => {
            console.log(roomparticipant);
            console.log(roomparticipant.ROOM_ID)
            res.send({ message: "User registered successfully!" });

        });
};

// get details
exports.getroomdetails = (req, res) => {
    RoomParticipant.findAll({
        where: {
            CHAT_STATUS: 0
        }
    }).then(roomparticipant => {

        res.json(roomparticipant)
    });
}

exports.getchatdetails = (req, res) => {
    Chat.findAll({
        where: {
            ROOM_ID_FK: {
                [Op.like]: req.body.ROOM_ID_FK
            }
        }
    })
        .then(chat => {

            res.json(chat)
        });
}

// const tasks = await Task.findAll({ include: User });

exports.jointable = (req, res) => {
    Chat.findOne({
        where: {
            ROOM_ID_FK: {
                [Op.like]: req.body.ROOM_ID_FK
            }
        }
    })
}





exports.getchatdetail = (req, res) => {
    Chat.findAll({
        where: {
            ROOM_ID_FK: {
                [Op.like]: req.body.ROOM_ID_FK
            }
        }
    })
        .then(chat => {

            res.json(chat)
        });
}


// schedule appointmet
exports.chat_scheduler = (req, res) => {
    const date1 = new Date().toISOString().
        replace(/T/, '').
        replace(/\..+/, '').
        replace([6], [0]);
    Chat_schedule.create({
        schedule_date: req.body.schedule_date,
        schedule_time: req.body.schedule_time,
        schedule_name: req.body.schedule_name,
        schedule_email: req.body.schedule_email,
        father_id: req.body.father_id,
        comments: req.body.comments
    })
        .then(chat_schedule => {
            console.log(chat_schedule);
            res.send({ message: "schudele appointment!" });
        })
}


// search appointment on based of date
exports.schedule_search = (req, res) => {
    if (req.body.schedule_date == "" || req.body.schedule_date == null) {
        res.send("no record");
    } else {
        Chat_schedule.findAll({
            where: {
                schedule_date: {
                    [Op.like]: '%' + req.body.schedule_date + '%'
                }
            }
        })
            .then(chat_schedule => {
                console.log(chat_schedule);
                if (chat_schedule.length == 0) {
                    return res.send({ message: "Record Not found." });
                }
                res.json(chat_schedule)
            })

    }
};
exports.updatepaster = (req, res) => {
    const ROOM_ID = req.body.ROOM_ID;
    User.update(req.body, {
        where: { PASTER_ID: ROOM_ID }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Pastor was updated successfully."
                });
            } else {
                // res.send({
                //     message: `Cannot update User with id=${ROOM_ID}. Maybe User was not found or req.body is empty!`
                // });
            }
        }).catch(err => {
            res.status(500).send({
                message: "Error updating username with id=" + ROOM_ID
            });
        });

}
exports.getTestaments = (request, response) => {
    var unirest = require("unirest");

    var req = unirest("GET", "https://ajith-holy-bible.p.rapidapi.com/GetBooks");

    req.headers({
        "x-rapidapi-key": "467e08f456msh93507c6001f4f3ap17790ejsn02e9191fc71a",
        "x-rapidapi-host": "ajith-holy-bible.p.rapidapi.com",
        "useQueryString": true
    });


    req.end(function (res) {
        if (res.error) throw new Error(res.error);
        response.send(res.body);
        console.log(res.body);
    });
}


exports.getChapters = (request, response) => {
    const book = request.body.book;
    const chapter = request.body.chapter;
    var unirest = require("unirest");
    var req = unirest("GET", "https://ajith-holy-bible.p.rapidapi.com/GetChapter");
    req.query({
        "Book": book,
        "chapter": chapter
    });

    req.headers({
        "x-rapidapi-key": "467e08f456msh93507c6001f4f3ap17790ejsn02e9191fc71a",
        "x-rapidapi-host": "ajith-holy-bible.p.rapidapi.com",
        "useQueryString": true
    });


    req.end(function (res) {
        if (res.error) throw new Error(res.error);

        console.log(res.body);
    });
}

exports.getVerses = (request, response) => {
    const book = request.body.book;
    const chapter = request.body.chapter;
    var unirest = require("unirest");

    var req = unirest("GET", "https://ajith-holy-bible.p.rapidapi.com/GetVerses");

    req.query({
        "Book": "Luke",
        "chapter": "1",
        "VerseFrom": "5",
        "VerseTo": "8"
    });

    req.headers({
        "x-rapidapi-key": "467e08f456msh93507c6001f4f3ap17790ejsn02e9191fc71a",
        "x-rapidapi-host": "ajith-holy-bible.p.rapidapi.com",
        "useQueryString": true
    });


    req.end(function (res) {
        if (res.error) throw new Error(res.error);

        console.log(res.body);
    });
}

exports.fetchStrongData = (req, res) => {

    console.log
    const bible = req.body.bible;
    const param = req.body.strong;
    let jsonResponse = new Array();
    let links = new Array();
    let divs = new Array();
    let st = 0;
    const url = 'https://www.stepbible.org/rest/search/masterSearch/version=' + bible + '%7Cstrong=' + param + '/en?lang=en'

    fetch(url).then(res => res.text()).then(response => {
        console.log("Response is" + response);
        let start = new Date();
        const $ = cheerio.load(response);
        let strongs = new Array();
        var verse;

        $('div span').each(function () {
            let v = $(this).find('.verseNumber').text();
            if (v.length < 1) {

            } else {
                verse = $(this).find('.verseNumber').text();
                divs.push(verse);
            }
            if (1) {

                var link = $(this).attr('strong');
                var value = $(this).text();
                strongs.push(st, { "verse": verse, "strong": link, "value": value });
                st++;
            }
        });

        $("div").each((index, element) => {

            jsonResponse.push($(element).text());

        });


        res.send({ "strongs": divs, "count": divs.length, "verses": jsonResponse });
        //console.log({"raw": response.body, "json":JSON.parse(response.body), "jsonresponse":jsonResponse, "strongs": strongs});

    }).catch(err => {
        console.log(err);
    });

}

exports.fetchBibleData = (req, res) => {
    const param = req.body.query;
    const bible = req.body.bible;
    let jsonResponse = new Array();
    let links = new Array();
    let verses = new Array();
    let st = 0;
    const url = 'https://www.stepbible.org/rest/search/masterSearch/version=' + bible + '%7Ctext=' + param + '/en?lang=en'
    const vgmUrl = 'https://www.stepbible.org/rest/search/masterSearch/version=ESV%7Ctext=Love%7Creference=Matt//////en?lang=en';

    fetch(url).then(res => res.text()).then(response => {
        let start = new Date();
        const $ = cheerio.load(response);
        let strongs = new Array();
        var verse;

        $('div.passageContentHolder span').each(function () {

            let v = $(this).find('.verseNumber').text();
            if (v.length < 1) {

            } else {
                verse = $(this).find('.verseNumber').text();
                verses.push(verse);

            }
            if (1) {

                if (typeof verse !== 'undefined' && verse !== null) {

                } else {

                }

                var link = $(this).attr('strong');
                var value = $(this).text();

                if (link === undefined) { } else {

                }
                strongs.push(st, { "verse": verse, "strong": link, "value": value });
                st++;
            }
        });
        $("div").each((index, element) => {

            jsonResponse.push($(element).text());

        });
        console.log(strongs.length + " START => " + start + " END => " + new Date());
        strongs = strongs.filter(function (element) {
            return element.strong !== undefined;
        });

        res.send({ "raw": response.body, "json": JSON.parse(response), "jsonresponse": jsonResponse, "strongs": strongs, "verses": verses });
    }).catch(err => {
        console.log(err);
    });

}

exports.getCounty = (req, res) => {
    Country.findAll()
        .then(country => {

            res.json(country)
        });
}

exports.getState = (req, res) => {
    State.findAll({
        where: {
            country_id: {
                [Op.like]: req.body.country_id
            }
        }
    })
        .then(state => {

            res.json(state)
        });
}

exports.getCity = (req, res) => {
    City.findAll({
        where: {
            state_id: {
                [Op.like]: req.body.state_id
            }
        }
    }).then(city => {

        res.json(city)
    });
}

exports.fetchCroessData = (req, res) => {
    const reference = req.body.reference; //"love";//req.body.query;
    const version = req.body.version;
    const value = req.body.value; //req.body.bible;
    let jsonResponse = new Array();
    let links = new Array();
    let divs = new Array();
    let st = 0;
    const url = 'https://www.stepbible.org/rest/search/masterSearch/version=' + version + '%7Ctext=' + value + '%7Creference=' + reference + '/en?lang=en'
    //const url = 'https://www.stepbible.org/rest/search/masterSearch/version=ESV%7Ctext=Walk%7Creference=Mat/en?lang=en'
    // const vgmUrl = 'https://www.stepbible.org/rest/search/masterSearch/version=ESV%7Ctext=Love/en?lang=en';
    console.log(url)
    fetch(url).then(res => res.text()).then(response => {
        // console.log(response);
        let start = new Date();
        const $ = cheerio.load(response);
        let strongs = new Array();
        var verse;

        $('div span').each(function () {
            let v = $(this).find('.verseNumber').text();
            if (v.length < 1) {

            } else {
                verse = $(this).find('.verseNumber').text();
                divs.push(verse);
            }
            if (1) {

                var link = $(this).attr('strong');
                var value = $(this).text();
                strongs.push(st, { "verse": verse, "strong": link, "value": value });
                st++;
            }
        });

        $("div").each((index, element) => {

            jsonResponse.push($(element).text());

        });


        res.send({ "strongs": divs, "count": divs.length, "verses": jsonResponse });
        console.log({ "raw": response.body, "json": JSON.parse(response), "jsonresponse": jsonResponse, "strongs": strongs });

    }).catch(err => {
        console.log(err);
    });
}



exports.uploadFile = (req, res) => {
    File.create({
        type: req.file.mimetype,
        name: req.file.originalname,
        data: req.file.buffer

    }).then(() => {
        res.json({ msg: 'File uploaded successfully! -> filename = ' + req.file.originalname });

    })

}
exports.listAllFiles = (req, res) => {
    File.findAll({ attributes: ['id', 'name'] }).then(files => {
        res.json(files);
    });
}

// mycodestarts

exports.updateChatStatus = (req, res) => {
    const chatID = req.param("id");
    RoomParticipant.update({ CHAT_STATUS: 1 }, {
        where: { id: chatID }
    })
        .then(num => {

            res.send("Status updated successfully")
        }).catch(err => {
            res.status(500).send({
                message: "Error updating username with id=" + username
            });
        });

}

exports.GetAllActiveChats = (req, res) => {
    RoomParticipant.findAll({
        where: {
            CHAT_STATUS: 1
        }
    }).then(data => {
        res.send(data)
    })
}

exports.GetAllChats = (req, res) => {
    roomparticipant.findAll()
        .then(data => {
            res.send(data)
        }).catch(err => res.send(err))
}


exports.GetAllBible = (req, res) => {
    Bible.findAll({
        where: {
            type: {
                [Op.like]: req.body.type
            },
            book: {
                [Op.like]: req.body.book
            },
            chapter: {
                [Op.like]: req.body.chapter
            }

        }
    }).then(data => {
        //  res.send(data);s
        res.json(data);
        console.log(data)
    })
}



// mycodeends

