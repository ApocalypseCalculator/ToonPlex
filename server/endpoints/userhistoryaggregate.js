const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/user/history/aggregate";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return req.auth;
}

module.exports.execute = function (req, res) {
    // This raw SQL query (targetted specifically for Postgres)
    // retrieves the highest ordered chapter for each toon that the user has read
    prisma.$queryRaw`SELECT date, chapterid, "order", "Toon".id as toonid, "Toon".slug as toonslug, "Toon".title as toontitle FROM 
    (SELECT DISTINCT ON ("Chapter".toonid) "ReadHistory".date, "Chapter".id as chapterid, "Chapter".order, "Chapter".toonid  
    FROM "ReadHistory" 
    INNER JOIN "Chapter" ON "ReadHistory".chapterid = "Chapter".id 
    WHERE userid=${req.auth.userid} 
    ORDER BY "Chapter".toonid ASC, "Chapter".order DESC) 
    INNER JOIN "Toon" ON toonid = "Toon".id;`.then((history) => {
        res.json(history);
    }).catch(err => {
        res.status(500).json({ error: `Internal server error` });
    })
}
