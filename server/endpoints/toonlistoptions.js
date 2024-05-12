const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/list/options";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = async function (req, res) {
    let condition = (!req.auth || (!req.auth.permissions.read && !req.auth.permissions.admin)) ? 
    {
        where: {
            toons: {
                some: {
                    published: true
                }
            }
        }
    } : {};
    prisma.$transaction([
        prisma.author.findMany(condition),
        prisma.artist.findMany(condition),
        prisma.genre.findMany(condition),
        prisma.tag.findMany(condition)
    ]).then(([authors, artists, genres, tags]) => {
        res.status(200).json({ status: 200, authors: authors, artists: artists, genres: genres, tags: tags });
    });
}
