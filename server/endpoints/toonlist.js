const { PrismaClient, UploadStatus } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/list";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    let offset = 0;
    if(req.query.page && !isNaN(parseInt(req.query.page)) && parseInt(req.query.page) > 0) {
        offset = parseInt(req.query.page) * 10;
    }
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
        },
        take: 10,
        skip: offset
    }).then((toons) => {
        res.json({ status: 200, offset: offset, toons: toons });
    });
}
