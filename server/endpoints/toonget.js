const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/get/:toonslug";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    if (req.params.toonslug) {
        prisma.toon.findUnique({
            where: {
                slug: req.params.toonslug,
                ...(!req.auth && {published: true}) // if not authorized, only published toons are viewable
            },
            include: {
                authors: true,
                artists: true,
                genres: true,
                tags: true,
                chapters: true,
                cover: {
                    select: {
                        transport: true
                    }
                }
            }
        }).then((toon) => {
            res.status(200).json({ status: 200, toon: toon });
        })
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
