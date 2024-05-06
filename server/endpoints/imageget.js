const { PrismaClient, UploadStatus } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/image/get/:transportid";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    if (req.params.transportid) {
        prisma.image.findUnique({
            where: {
                transport: req.params.transportid,
                status: UploadStatus.UPLOADED
            }
        }).then((image) => {
            if(image) {
                res.sendFile(image.path, 
                    { root: './content', immutable: true, maxAge: 31556926 * 1000 });
                // a very long cache time (apparently express uses millis here)
                // if the image is updated, a new transport id is assigned
                // to cache bust, the client must request the image with the new transport id
            }
            else {
                res.status(404).json({ error: `Image not found` });
            }
        });
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
