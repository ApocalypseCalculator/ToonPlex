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
            userid: req.auth.id,
            toon: {
                ...((!req.auth || (!req.auth.permissions.read && !req.auth.permissions.admin)) && { published: true })
            }
        },
        select: {
            toon: {
                select: {
                    slug: true
                }
            },
            date: true
        }
    }).then((favourites) => {
        favourites.forEach((favourite) => {
            favourite.slug = favourite.toon.slug;
            delete favourite.toon;
        });
        res.status(200).json({ status: 200, favourites: favourites });
    });
}
