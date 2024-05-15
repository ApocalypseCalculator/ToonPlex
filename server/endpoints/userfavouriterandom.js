const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/user/favourite/random";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return req.auth;
}

const DEFAULT_PAGE_SIZE = 4;

// returns n random favourites for the user
// raw query to take advantage of native Postgres RANDOM() 
module.exports.execute = function (req, res) {
    let amount = parseInt(req.query.amount) || DEFAULT_PAGE_SIZE;

    prisma.$queryRaw`SELECT "date", toonid, "Toon".slug, "Toon".title, "Toon"."status", "Image".transport FROM 
        (SELECT "date", toonid FROM "Favourite" WHERE userid = ${req.auth.id} ORDER BY RANDOM() LIMIT ${amount}) 
        AS random_favourites 
        INNER JOIN "Toon" ON "Toon".id = toonid 
        LEFT JOIN "Image" ON "Image".id = "Toon".coverid;`
    .then((favourites) => {
        res.status(200).json({ status: 200, favourites: favourites });
    }).catch(err => {
        res.status(500).json({ status: 500, error: `Internal server error` });
    });
}
