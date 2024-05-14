const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/user/favourite/get";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return req.auth;
}

// returns ALL favourites for the user
module.exports.execute = function (req, res) {
    prisma.favourite.findMany({
        where: {
            userid: req.auth.id
        },
        select: {
            toon: {
                select: {
                    slug: true,
                    id: true
                }
            },
            date: true
        }
    }).then((favourites) => {
        res.status(200).json({ status: 200, favourites: favourites });
    });
}
