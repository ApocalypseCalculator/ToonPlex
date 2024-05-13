const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/toon/search";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return req.auth;
}

const DEFAULT_PAGE_SIZE = 24;

/*
while the list endpoint returns a paginated, filtered list, 
the search endpoint returns a list based on a search query only
this is a more expensive endpoint to hit because we are using the 
Postgres native ts_rank

since it is more expensive, we will require authentication

note: 
this query does not return its one-to-many relations like 
authors, artists, genres, tags, etc.
*/

module.exports.execute = function (req, res) {
    let amount = parseInt(req.query.amount) || DEFAULT_PAGE_SIZE;
    let page = (parseInt(req.query.page) || 1);
    let offset = (page - 1) * amount;
    if(req.query.query && req.query.query !== "" && typeof req.query.query === "string") {
        prisma.$queryRaw`
        SELECT searchres.id, title, slug, published, searchres."status", "Image".transport, full_count FROM 
        (
            SELECT *, ts_rank(search, websearch_to_tsquery('english', ${req.query.query})) rank, count(*) OVER() AS full_count 
            FROM "Toon" WHERE search @@ websearch_to_tsquery('english', ${req.query.query}) 
            ORDER BY rank DESC 
            OFFSET ${offset} LIMIT ${amount}
        ) AS searchres 
        LEFT JOIN "Image" ON searchres.coverid = "Image".id;`.then((toons) => {
                let count = (toons.length > 0 ? Number(toons[0].full_count) : 0);
                toons.map((toon) => {
                    delete toon.full_count; // why is prisma returning bigint??
                    if(toon.transport) {
                        toon.cover = {
                            transport: toon.transport
                        };
                        delete toon.transport;
                    }
                    return toon;
                });
                res.status(200).json({ 
                    status: 200, 
                    page: page, 
                    pagesize: amount, 
                    total: count, 
                    toons: toons 
                });
            });
    } else {
        res.status(400).json({ status: 400, error: `Invalid form` });
    }
}
