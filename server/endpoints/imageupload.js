const { PrismaClient, UploadStatus } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

module.exports.name = "/api/image/upload/:transportid";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return (req.auth && (req.auth.permissions.create || req.auth.permissions.admin));
}

module.exports.execute = function (req, res) {
    if (req.files.image && req.params.transportid) {
        prisma.image.findUnique({
            where: {
                transport: req.params.transportId,
                status: UploadStatus.PENDING
            }
        }).then((image) => {
            if(image) {
                if(!fs.existsSync(path.dirname(`./content/${image.path}`))) {
                    fs.mkdirSync(path.dirname(`./content/${image.path}`), {recursive: true});
                }
                req.files.image.mv(`./content/${image.path}`);
                prisma.image.update({
                    where: {
                        id: image.id
                    },
                    data: {
                        status: UploadStatus.UPLOADED
                    }
                }).then(() => {
                    res.status(200).json({ status: 200, message: `Image uploaded` });
                });
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
