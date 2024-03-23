const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/chapter/transports/get";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    if (req.body.chapterid) {
        prisma.chapter.findUnique({
            where: {
                id: req.body.chapterid
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
        }).then((page) => {
            res.status(200).json({ status: 200, transports: page.pages });
        })
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
