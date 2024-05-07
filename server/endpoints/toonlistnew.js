const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/list/new";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function(req, res) {
    // newly published toons (or newly uploaded if user has perms)
    prisma.toon.findMany({
        where: {
            ...((!req.auth || (!req.auth.permissions.read && !req.auth.permissions.admin)) && { published: true })
        },
        orderBy: {
            id: 'desc'
        },
        take: {
            count: 6
        }
    }).then((toons) => {
        res.status(200).json({ status: 200, toons: toons });
    });
}
