const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/user/history/toon/:toonslug";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    if(req.params.toonslug) {
        prisma.readHistory.findMany({
            where: {
                user: {
                    id: req.auth.id
                },
                chapter: {
                    toon: {
                        slug: req.params.toonslug
                    }
                }
            },
            orderBy: {
                chapter: {
                    order: 'desc'
                }
            }
        }).then((history) => {
            res.json({status: 200, history: history});
        });
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
