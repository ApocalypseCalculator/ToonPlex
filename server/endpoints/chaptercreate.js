const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/chapter/create";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    if (req.body.slug && req.body.title) {
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
                                    path: `${req.body.toonid}/${req.body.slug}/${i + 1}.${req.body.ext}`
                                }
                            }
                        }
                    })
                }
            }
        })
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
