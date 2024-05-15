require('dotenv').config();

const express = require("express");
const fs = require('fs');
const fileUpload = require('express-fileupload');
const path = require('path');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/*
required .env configurations: 
DB_URL: the URL to the database (recommended Postgres)
JWTSECRET: the secret for JWT verification
PORT: the port to run the server on
*/

if(!process.env.DB_URL || !process.env.JWTSECRET || !process.env.PORT) {
    console.error('\x1b[31mMissing required environment variables\x1b[39m');
    process.exit(1);
}

const app = express();

app.enable('trust proxy');
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ strict: true }));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './tmp/',
    limits: {
        fieldSize: 50 * 1024 * 1024 // surely no one will upload a file larger than 50MB
    },
    safeFileNames: true,
    abortOnLimit: true
}));

app.use(async (req, res, next) => {
    if(req.headers['authorization']) {
        try {
            let user = jwt.verify(req.headers['authorization'], process.env.JWTSECRET);
            if(user.userid && !isNaN(parseInt(user.userid))) {
                let queryusr = await prisma.user.findUnique({
                    where: {
                        id: parseInt(user.userid)
                    },
                    include: {
                        permissions: true
                    }
                });
                if(queryusr && queryusr.permissions && !queryusr.permissions.disabled) {
                    req.auth = queryusr;
                }
            }
        }
        catch(err) {
            // unsucessful auth
        }
    }
    next();
});

var endpoints = {};
fs.readdirSync("./endpoints/").forEach(function (file) {
    let m = require("./endpoints/" + file);
    if (m.name == null || m.execute == null || m.method == null) {
        console.error(`\x1b[31mInvalid endpoint: ${file}\x1b[0m`);
    } else if (m.name in endpoints && endpoints[m.name] == m.method) {
        console.error(
            `\x1b[31mDuplicate endpoint: ${file} (${m.method} ${m.name})\x1b[0m`
        );
    } else {
        endpoints[m.name] = m.method;
        app[m.method.toLowerCase()](m.name, (req, res, next) => {
            if (m.verify(req, res, next)) {
                try {
                    m.execute(req, res, next);
                }
                catch {
                    res.sendStatus(500).end();
                }
            }
            else {
                res.status(403).json({ status: 403, error: 'Access denied' });
            }
        });
        console.log(`Loaded endpoint: ${m.method} ${file} (${m.name})`);
    }
});

app.use(express.static('../client/dist', { extensions: ["html"] }));
app.use(express.static('./static', { extensions: ["html"] }));

app.use('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, `../client/dist/index.html`));
})

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});