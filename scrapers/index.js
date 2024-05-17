require('dotenv').config();

const scrapers = require('./suite');
const axios = require('axios').default;
const { fork } = require('child_process');
const fs = require('fs');

const DATAPATH = `./data.json`;
if (!fs.existsSync(DATAPATH)) {
    fs.writeFileSync(DATAPATH, '{}');
}
let DATAFILE = JSON.parse(fs.readFileSync(DATAPATH));
const VERBOSE = (process.argv.includes('--verbose') || process.argv.includes('-v'));

/*
required .env configurations: 
HOST: the host of the server (include scheme and origin, e.g. http://127.0.0.1:8080)
DOWNLOADPATH: the path to download images to (e.g. ./tmp)
*/

if (!process.env.HOST || !process.env.DOWNLOADPATH) {
    console.error('\x1b[31mMissing required environment variables\x1b[39m');
    process.exit(1);
}

const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
let token = '';

if (fs.existsSync(process.env.DOWNLOADPATH)) {
    console.log(`\x1b[33mWarning: it is recommended to clear the download directory before each run to prevent excessive disk usage\x1b[39m`);
}
else {
    console.log(`Creating download directory...`);
    fs.mkdirSync(process.env.DOWNLOADPATH);
}

login(mainScraper);

function login(callback) {
    if (DATAFILE.token) {
        axios.get(`${process.env.HOST}/api/user/favourite/random?amount=0`, {
            headers: {
                Authorization: DATAFILE.token
            }
        }).then(() => {
            token = DATAFILE.token;
            console.log('\x1b[32mLogged in successfully\x1b[39m');
            callback();
            return;
        }).catch((err) => {
            console.error('\x1b[31mToken invalid\x1b[39m');
            delete DATAFILE.token;
            fs.writeFileSync(DATAPATH, JSON.stringify(DATAFILE));
            if (err.response.status == 403) {
                login(callback);
            }
        });
    }
    else {
        readline.question('Enter username >> ', username => {
            readline.question('Enter password >> ', password => {
                axios.post(`${process.env.HOST}/api/user/login`, {
                    username: username,
                    password: password
                }).then(res => {
                    if (res.data.token) {
                        token = res.data.token;
                        console.log('\x1b[32mLogged in successfully\x1b[39m');
                        DATAFILE.token = token;
                        fs.writeFileSync(DATAPATH, JSON.stringify(DATAFILE));
                        callback();
                        return;
                    }
                    else {
                        console.error('\x1b[31mUnexpected error\x1b[39m');
                        process.exit(1);
                    }
                }).catch(err => {
                    console.error('\x1b[31mLogin failed\x1b[39m');
                    if (err.response.status == 401) {
                        login(callback);
                    }
                });
            });
        });
    }
}

function mainScraper() {
    readline.question(`Enter URL to scrape (make sure it is the main page) >> `, async (link) => {
        readline.close();
        let url = new URL(link);
        let scraper = scrapers.find(s => s.domain === url.host);
        if (scraper) {
            console.log(`Spawning ${scraper.name}...`);
            const child = fork(`${__dirname}/suite/${scraper.file}`);
            child.on('spawn', () => {
                console.log(`Process \x1b[32m[scraper-${child.pid}]\x1b[39m spawned...`);
                child.send({
                    command: 'scrape',
                    data: {
                        url: link
                    }
                });
            });
            let toondata = {
                toonid: '',
                cover: '',
                chapters: new Map()
            }
            let reqqueue = [];
            let scrapedone = false;

            // request queue at end

            child.on('message', msg => {
                if (msg.event === "toon") {
                    // POST to create toon API
                    reqqueue.push({
                        condition: () => { return true },
                        method: 'post',
                        url: `${process.env.HOST}/api/toon/create`,
                        data: msg.data,
                        callback: (res, toondata) => {
                            if (res.data.status == 201) {
                                toondata.toonid = res.data.toon.id;
                                toondata.cover = res.data.toon.cover.transport;
                                console.log(`Toon created with ID ${toondata.toonid}`);
                            }
                        }
                    });
                }
                else if (msg.event === "chapter") {
                    // POST to create chapter API
                    // note that this should depend on the successful completion of 
                    // the create toon call
                    // fetch transports and store into toon data after creation
                    reqqueue.push({
                        condition: (toondata) => { return toondata.toonid !== '' },
                        method: 'post',
                        url: `${process.env.HOST}/api/chapter/create`,
                        data: {
                            toonid: toondata.toonid, ...msg.data
                        },
                        callback: (res, toondata) => {
                            if (res.data.status == 201) {
                                if (VERBOSE) {
                                    console.log(`Chapter ${msg.data.order} created with ID ${res.data.chapter}`);
                                }
                                reqqueue.push({
                                    condition: (toondata) => { return true },
                                    method: 'get',
                                    url: `${process.env.HOST}/api/chapter/transports/get/${res.data.chapter}`,
                                    data: {},
                                    callback: (res, toondata) => {
                                        toondata.chapters.set(msg.data.order, res.data.transports);
                                        console.log(`Transports initialized for chapter ${msg.data.order}`);
                                    }
                                });
                            }
                        }
                    });
                }
                else if (msg.event === "image") {
                    // POST to create image API
                    // note that this should depend on the successful completion of 
                    // the create chapter call
                    reqqueue.push({
                        condition: (toondata) => { return toondata.chapters.has(msg.data.chapter) },
                        method: 'post',
                        url: (toondata) => {
                            return `${process.env.HOST}/api/image/upload/${toondata.chapters.get(msg.data.chapter)[msg.data.page].image.transport}`
                        },
                        data: {
                            image: msg.data.path
                        },
                        callback: (res, toondata) => {
                            if (res.status == 200) {
                                if (VERBOSE) {
                                    console.log(`Image uploaded for chapter ${msg.data.chapter} page ${msg.data.page}`);
                                }
                                else {
                                    if (toondata.chapters.get(msg.data.chapter).length == msg.data.page + 1) {
                                        console.log(`Finished page uploads for chapter ${msg.data.chapter}`);
                                    }
                                }
                            }
                        }
                    })
                }
                else if (msg.event === "cover") {
                    // special type of image event
                    // POST to cover's transport
                    // depends on successful completion of create toon call (implied by existence of cover transport)
                    reqqueue.push({
                        condition: (toondata) => { return toondata.cover !== '' },
                        method: 'post',
                        url: (toondata) => {
                            return `${process.env.HOST}/api/image/upload/${toondata.cover}`
                        },
                        data: {
                            image: msg.data.path
                        },
                        callback: (res, toondata) => {
                            if (res.status == 200) {
                                console.log(`Uploaded cover successfully`);
                            }
                        }
                    });
                }
                else if (msg.event === "log") {
                    console.log(`\x1b[32m[scraper-${child.pid}]: \x1b[39m${msg.data}`);
                }
            });

            child.on('exit', () => {
                scrapedone = true;
                console.log('Scraper process exited');
            });

            // home made request queue
            // each request contains a condition
            // iterate through requests and send them if the condition is met
            let lastreport = Date.now();
            while (reqqueue.length > 0 || !scrapedone) {
                if (Date.now() - lastreport > (VERBOSE ? 5000 : 30000)) {
                    // report every 5 or 30 seconds depending on verbosity
                    console.log(`${reqqueue.length} requests in queue`);
                    lastreport = Date.now();
                }
                // pop the first request out
                let req = reqqueue.shift();
                if (req) {
                    if (req.condition(toondata)) {
                        let requrl = (typeof req.url === "function" ? req.url(toondata) : req.url);
                        if (VERBOSE) {
                            console.log(`Sending request ${req.method} to ${requrl}`);
                        }
                        let res = await axios({
                            method: req.method,
                            url: requrl,
                            data: req.data.image ? {
                                image: fs.createReadStream(req.data.image)
                            } : req.data,
                            headers: {
                                'Authorization': token,
                                'Content-Type': !req.data.image ? 'application/json' : 'multipart/form-data'
                            },
                            maxRedirects: req.data.image ? 0 : 5
                        });
                        req.callback(res, toondata);
                        // wait 1 sec for the next request
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    else {
                        // if the condition isn't satisfied, push it back to the queue
                        // we skip the queue timeout here
                        if (VERBOSE) {
                            console.log(`Request condition not met, requeueing`);
                        }
                        reqqueue.push(req);
                    }
                }
                else {
                    // wait 2 sec for queue to fill up
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            console.log('\x1b[32mAll requests completed, exiting\x1b[39m');
            process.exit(0);
        } else {
            console.log(`No scraper found for ${url.host}`);
        }
    });
}
