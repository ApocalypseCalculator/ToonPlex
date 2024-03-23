const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/chapter/create";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    if (req.body.name && req.body.order) {
        prisma.chapter.create({
            data: {
                name: req.body.name,
                date: new Date(req.body.date),
                toonid: req.body.toonid,
                order: req.body.order,
                pages: {
                    create: Array(req.body.pages).fill().map((_, i) => {
                        return {
                            order: i + 1,
                            image: {
                                create: {
                                    path: `${req.body.toonid}/${req.body.order}/${i + 1}.${req.body.ext}`
                                }
                            }
                        }
                    })
                }
            }
        }).then((chapter) => {
            res.status(200).json({ status: 201, message: `Chapter created`, chapter: chapter.id });
        });
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
