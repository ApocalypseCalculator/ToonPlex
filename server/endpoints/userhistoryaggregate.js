const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/user/history/aggregate";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return req.auth;
}

const DEFAULT_PAGE_SIZE = 6;

module.exports.execute = function (req, res) {
    let amount = parseInt(req.query.amount) || DEFAULT_PAGE_SIZE;
    let page = (parseInt(req.query.page) || 1);
    let offset = (page - 1) * amount;
    // This raw SQL query (targetted specifically for Postgres)
    // retrieves the highest ordered chapter for each toon that the user has read
    prisma.$queryRaw`SELECT date, chapterid, "order", name, "Toon".id as toonid, "Toon".slug as toonslug, "Toon".title as toontitle, "Image".transport FROM 
    (SELECT DISTINCT ON ("Chapter".toonid) "ReadHistory".date, "Chapter".id as chapterid, "Chapter".order, "Chapter".toonid, "Chapter".name 
    FROM "ReadHistory" 
    INNER JOIN "Chapter" ON "ReadHistory".chapterid = "Chapter".id 
    WHERE userid=${req.auth.id} 
    ORDER BY "Chapter".toonid ASC, "Chapter".order DESC) AS weird_pg_moment 
    INNER JOIN "Toon" ON toonid = "Toon".id 
    LEFT JOIN "Image" ON "Toon".coverid = "Image".id 
    ORDER BY "date" DESC 
    OFFSET ${offset} LIMIT ${amount == 0 ? 'NULL' : amount};`.then((history) => {
        history.map((toon) => {
            toon.cover = {
                transport: toon.transport
            };
            delete toon.transport;
            return toon;
        });
        res.json({ status: 200, history: history });
    }).catch(err => {
        console.error(err);
        res.status(500).json({ status: 500, error: `Internal server error` });
    })
}
