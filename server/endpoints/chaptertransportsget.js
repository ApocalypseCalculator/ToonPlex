const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/chapter/transports/get/:chapterid";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    if (req.params.chapterid && !isNaN(parseInt(req.params.chapterid))) {
        prisma.chapter.findUnique({
            where: {
                id: parseInt(req.params.chapterid)
            },
            select: {
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
            res.status(200).json({ status: 200, transports: chapter.pages });
        })
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
