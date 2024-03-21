const { PrismaClient, UploadStatus } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/image/upload/:transportId";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    if (req.files.image && req.params.transportId) {
        prisma.image.findUnique({
            where: {
                transport: req.params.transportId
            }
        }).then((image) => {
            if(image) {
                req.files.image.mv(`./content/${image.path}`);
                prisma.image.update({
                    where: {
                        id: image.id
                    },
                    data: {
                        status: UploadStatus.UPLOADED
                    }
                });
                res.status(200).json({ status: 200, message: `Image uploaded` });
            }
            else {
                res.status(404).json({ error: `Transport not found` });
            }
        });
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
