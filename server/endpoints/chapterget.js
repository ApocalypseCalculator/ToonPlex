const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/chapter/get/:chapterid";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    if (req.params.chapterid) {
        prisma.chapter.findUnique({
            where: {
                id: req.body.chapterid,
                ...(!req.auth && {
                    toon: {
                        published: true
                    }}) // if not authorized, only published toons are viewable
            },
            include: {
                toon: true,
                pages: {
                    select: {
                        order: true,
                        image: {
                            select: {
                                transport: true
                            }
                        }
                    }
                }
            }
        }).then((chapter) => {
            res.status(200).json({ status: 200, chapter: chapter });
        })
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
