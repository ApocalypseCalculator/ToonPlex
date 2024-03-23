const { PrismaClient, UploadStatus } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/list";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    prisma.toon.findMany({
        where: {
            ...(!req.auth && {published: true})
        },
        include: {
            cover: {
                where: {
                    status: UploadStatus.UPLOADED
                },
                select: {
                    transport: true
                }
            }
        }
    }).then((toons) => {
        res.json({ status: 200, toons: toons });
    });
}
