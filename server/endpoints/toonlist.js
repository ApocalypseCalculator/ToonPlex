const { PrismaClient, UploadStatus, Status } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/list";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

const DEFAULT_PAGE_SIZE = 24;

/*
parameters: 
page: number (page # for pagination)
amount: number (amount of toons to return at given page)
author: string (author name to filter by)
artist: string (artist name to filter by)
genre: string (genre name to filter by)
tag: string (tag name to filter by)
status: enum(string) (status to filter by)

support will be added for multiple authors, artists, genres, and tags later

results are ordered by id in descending order, i.e. newest to oldest
*/

module.exports.execute = function (req, res) {
    let amount = parseInt(req.query.amount) || DEFAULT_PAGE_SIZE;
    let offset = ((parseInt(req.query.page) || 1) - 1) * amount;
    let queryfilter = {
        ...((!req.auth || (!req.auth.permissions.read && !req.auth.permissions.admin)) && { published: true }),
        ...(req.query.author && {
            authors: {
                some: {
                    name: {
                        equals: req.query.author
                    }
                }
            }
        }),
        ...(req.query.artist && {
            artists: {
                some: {
                    name: {
                        equals: req.query.artist
                    }
                }
            }
        }),
        ...(req.query.genre && {
            genres: {
                some: {
                    name: {
                        equals: req.query.genre
                    }
                }
            }
        }),
        ...(req.query.tag && {
            tags: {
                some: {
                    name: {
                        equals: req.query.tag
                    }
                }
            }
        }),
        ...((req.query.status && typeof req.query.status === "string" && Status[req.query.status.toUpperCase()]) && {
            status: Status[req.query.status.toUpperCase()]
        })
    };
    Promise.all([
        prisma.toon.count({
            where: queryfilter
        }),
        prisma.toon.findMany({
            where: queryfilter,
            select: {
                id: true,
                slug: true,
                title: true,
                authors: true,
                artists: true,
                genres: true,
                tags: true,
                status: true,
                published: true,
                cover: {
                    where: {
                        status: UploadStatus.UPLOADED
                    },
                    select: {
                        transport: true
                    }
                }
            },
            take: amount,
            skip: offset,
            orderBy: {
                id: 'desc'
            }
        })
    ]).then(([count, toons]) => {
        res.json({ status: 200, offset: offset, pagesize: amount, total: count, toons: toons });
    });
}
