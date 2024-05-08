const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/user/history/record/:toonslug/:chapterorder";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    let todelete = !!req.query.delete;
    if (req.params.toonslug && req.params.chapterorder && !isNaN(parseInt(req.params.chapterorder))) {
        prisma.chapter.findFirst({
            where: {
                toon: {
                    slug: req.params.toonslug
                },
                order: parseInt(req.params.chapterorder)
            }
        }).then((chapter) => {
            if (chapter) {
                prisma.readHistory.findFirst({
                    where: {
                        userid: req.auth.id,
                        chapterid: chapter.id
                    }
                }).then((history) => {
                    if (history && todelete) {
                        prisma.readHistory.delete({
                            where: {
                                userid: req.auth.id,
                                chapterid: chapter.id
                            }
                        }).then(() => {
                            res.status(200).json({ status: 200, message: `Read history deleted` });
                        });
                    }
                    else if (!history && !todelete) {
                        prisma.readHistory.create({
                            data: {
                                userid: req.auth.id,
                                chapterid: chapter.id
                            }
                        }).then(() => {
                            res.status(201).json({ status: 201, message: `Read history created` });
                        });
                    }
                    else {
                        res.status(204).json({ status: 204, message: `No change` });
                    }
                });
            }
            else {
                res.status(404).json({ error: `Chapter not found` });
            }
        });
    }
    else {
        res.status(400).json({ error: `Invalid form` });
    }
}
