const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/user/favourite/record/:toonslug";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    let todelete = !!req.body.delete;
    if (req.params.toonslug) {
        prisma.toon.findUnique({
            where: {
                slug: req.params.toonslug
            },
            select: {
                id: true
            }
        }).then((toon) => {
            if (toon) {
                prisma.favourite.findUnique({
                    where: {
                        userid_toonid: {
                            toonid: toon.id,
                            userid: req.auth.id
                        }
                    }
                }).then((favourite) => {
                    if (favourite && todelete) {
                        prisma.favourite.delete({
                            where: {
                                userid_toonid: {
                                    toonid: toon.id,
                                    userid: req.auth.id
                                }
                            }
                        }).then(() => {
                            res.status(200).json({ status: 200, message: `Favourite deleted` });
                        });
                    }
                    else if (!favourite && !todelete) {
                        prisma.favourite.create({
                            data: {
                                toonid: toon.id,
                                userid: req.auth.id
                            }
                        }).then(() => {
                            res.status(201).json({ status: 201, message: `Favourite created` });
                        });
                    }
                    else {
                        res.status(204).json({ status: 204, message: `No change` });
                    }
                });
            }
            else {
                res.status(404).json({ status: 404, error: `Toon not found` });
            }
        });
    }
    else {
        res.status(400).json({ status: 400, error: `Invalid form` });
    }
}
