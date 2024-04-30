const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.name = "/api/user/login";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return (!req.auth);
}

module.exports.execute = function (req, res) {
    if (req.body.username && req.body.password) {
        prisma.user.findUnique({
            where: {
                username: req.body.username
            },
            include: {
                permissions: true
            }
        }).then((user) => {
            if (!user) {
                res.status(401).json({ error: "Incorrect password or username" });
            }
            else {
                bcrypt.compare(req.body.password, user.password, function (err, result) {
                    if (err) {
                        res.status(500).json({ error: `Server error` })
                    }
                    else {
                        if (!result) {
                            res.status(401).json({ error: "Incorrect password or username" });
                        }
                        else {
                            let token = jwt.sign({
                                username: user.username,
                                userid: user.id,
                                registertime: user.registertime,
                                permissions: user.permissions
                            }, process.env.JWTSECRET);
                            res.json({ token: token });
                        }
                    }
                });
            }
        })
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
