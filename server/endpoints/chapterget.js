const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/chapter/get/:toonslug/:chapter";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    if (req.params.toonslug && req.params.chapter) {
        prisma.chapter.findUnique({
            where: {
                toon: {
                    slug: req.params.toonslug
                },
                order: parseInt(req.params.chapter),
                ...(!req.auth && {
                    toon: {
                        slug: req.params.toonslug,
                        published: true
                    }}) // if not authorized, only published toons are viewable
            },
            include: {
                toon: {
                    include: {
                        _count: {
                            select: {
                                chapters: true
                            }
                        }
                    }
                },
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
