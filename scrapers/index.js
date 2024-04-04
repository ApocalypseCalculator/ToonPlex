const scrapers = require('./suite');
const axios = require('axios').default;
const { fork } = require('child_process');
const fs = require('fs');
const config = require('./config');

const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(`Enter URL to scrape (make sure it is the main page) >> `, link => {
    readline.close();
    let url = new URL(link);
    let scraper = scrapers.find(s => s.domain === url.host);
    if (scraper) {
        console.log(`Spawning ${scraper.name}...`);
        const child = fork(`${__dirname}/suite/${scraper.file}`);
        child.on('spawn', () => {
            console.log(`Process \x1b[33m[scraper-${child.pid}]\x1b[39m spawned...`);
            child.send({
                command: 'scrape',
                data: {
                    url: link
                }
            });
        });
        let toondata = {
            toonid: '',
            chapters: new Map()
        }
        let reqqueue = [];
        let scrapedone = false;
        
        let reqinterval = setInterval(() => {
            for(let i = 0; i < reqqueue.length; i++) {
                let req = reqqueue[i];
                if(req.condition(toondata)) {
                    axios[req.method](req.url, req.data, {
                        headers: {
                            Authorization: config.token,
                            'Content-Type': !req.data.image ? 'application/json' : 'multipart/form-data'
                        }
                    }).then(res => {
                        req.callback(res, toondata);
                        reqqueue.splice(i, 1);
                    }).catch(err => {
                        console.error(err);
                    });
                }
            }
            if(reqqueue.length === 0 && scrapedone) {
                clearInterval(reqinterval);
                console.log('All requests completed, exiting');
                process.exit(0);
            }
        }, 1000);

        child.on('message', msg => {
            if(msg.event === "toon") {
                // POST to create toon API
                reqqueue.push({
                    condition: () => {return true},
                    method: 'post',
                    url: `${config.host}/api/toon/create`,
                    data: msg.data,
                    callback: (res, toondata) => {
                        if(res.data.status == 201) {
                            toondata.toonid = res.data.toon;
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
                    condition: (toondata) => {return toondata.toonid !== ''},
                    method: 'post',
                    url: `${config.host}/api/chapter/create`,
                    data: {
                        toonid: toondata.toonid, ...msg.data
                    },
                    callback: (res, toondata) => {
                        if(res.data.status == 201) {
                            console.log(`Chapter ${msg.data.order} created with ID ${res.data.chapter}`);
                            reqqueue.push({
                                condition: (toondata) => {return true},
                                method: 'get',
                                url: `${config.host}/api/chapter/transports/get/${res.data.chapter}`,
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
                    condition: (toondata) => {return toondata.chapters.has(msg.data.chapter)},
                    method: 'post',
                    url: `${config.host}/api/image/upload/${toondata.chapters.get(msg.data.chapter)[msg.data.page].image.transport}`,
                    data: {
                        image: fs.createReadStream(msg.path)
                    },
                    callback: (res, toondata) => {
                        if(res.status == 200) {
                            console.log(`Image uploaded for chapter ${msg.data.chapter} page ${msg.data.page}`);
                        }
                    }
                })
            }
            else if (msg.event === "log") {
                console.log(`\x1b[33m[scraper-${child.pid}]: \x1b[39m${msg.data}`);
            }
        });

        child.on('exit', () => {
            scrapedone = true;
            console.log('Scraper process exited');
        });
    } else {
        console.log(`No scraper found for ${url.host}`);
    }
});
