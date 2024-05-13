const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/create";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return (req.auth && (req.auth.permissions.create || req.auth.permissions.admin));
}

module.exports.execute = function (req, res) {
    // we assume (perhaps too naively)
    // that the client will always supply the correct data
    if (req.body.slug && req.body.title) {
        prisma.toon.create({
            data: {
                slug: req.body.slug,
                title: req.body.title,
                alttitle: req.body.alttitle,
                summary: req.body.summary,
                authors: {
                    connectOrCreate: req.body.authors.map((author) => {
                        return {
                            where: {
                                name: author
                            },
                            create: {
                                name: author
                            }
                        }
                    })
                },
                artists: {
                    connectOrCreate: req.body.artists.map((artist) => {
                        return {
                            where: {
                                name: artist
                            },
                            create: {
                                name: artist
                            }
                        }
                    })
                },
                genres: {
                    connectOrCreate: req.body.genres.map((genre) => {
                        return {
                            where: {
                                name: genre
                            },
                            create: {
                                name: genre
                            }
                        }
                    })
                },
                tags: {
                    connectOrCreate: req.body.tags.map((tag) => {
                        return {
                            where: {
                                name: tag
                            },
                            create: {
                                name: tag
                            }
                        }
                    })
                }
            }
        }).then((toon) => {
            prisma.toon.update({
                where: {
                    id: toon.id
                },
                data: {
                    cover: {
                        create: {
                            path: `${toon.id}/cover.${req.body.ext}`
                        }
                    }
                },
                include: {
                    cover: true
                }
            }).then((newtoon) => {
                res.status(201).json({ status: 201, message: `Toon created`, toon: newtoon});
            });
        }).catch(err => {
            res.status(500).json({ status: 500, error: `Server error` });
        });
    }
    else {
        res.status(400).json({ status: 400, error: `Invalid form` });
    }
}
