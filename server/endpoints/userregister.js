const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

module.exports.name = "/api/user/register";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return (!req.auth);
}

module.exports.execute = function (req, res) {
    if (req.body.username && req.body.password) {
        if (!/^\w+$/.test(req.body.username) || req.body.username.length > 32) {
            res.status(400).json({ status: 400, error: `Usernames can only contain alphanumeric characters or underscores and must be at most 33 characters` });
        }
        else if (!/^\w+$/.test(req.body.password) || req.body.password.length < 8) {
            res.status(400).json({ status: 400, error: `Passwords can only contain alphanumeric characters or underscores and must be at least 8 characters` });
        }
        else {
            prisma.user.findUnique({
                where: {
                    username: req.body.username
                }
            }).then(user => {
                if (user) {
                    res.status(400).json({ status: 400, error: `Username taken` });
                }
                else {
                    bcrypt.hash(req.body.password, 10, function (err, pwdhash) {
                        if (err) {
                            res.status(500).json({ status: 500, error: `Server error` });
                        }
                        else {
                            prisma.user.create({
                                data: {
                                    username: req.body.username,
                                    password: pwdhash,
                                    permissions: {
                                        create: {} // default perms
                                    }
                                }
                            }).then(() => {
                                res.status(201).json({ status: 201, message: `User created` });
                            });
                        }
                    })
                }
            });
        };
    }
    else {
        res.status(400).json({ status: 400, error: `Invalid form` });
    }
}
