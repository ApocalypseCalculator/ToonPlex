const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/get/:toonid";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    if (req.params.toonid) {
        prisma.toon.findUnique({
            where: {
                id: req.params.toonid,
                ...(!req.auth && {published: true}) // if not authorized, only published toons are viewable
            },
            include: {
                authors: true,
                artists: true,
                genres: true,
                tags: true,
                chapters: true,
                cover: true
            }
        }).then((toon) => {
            res.status(200).json({ status: 200, toon: toon });
        })
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
