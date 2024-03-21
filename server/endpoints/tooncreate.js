const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/create";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    if (req.body.slug && req.body.title) {
        prisma.toon.create({
            data: {
                slug: req.body.slug,
                title: req.body.title,
                alttitle: req.body.alttitle,
                summary: req.body.summary
            }
        })
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
