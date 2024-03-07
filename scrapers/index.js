const scrapers = require('./suite');

const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(`Enter URL to scrape (make sure it is the main page) >> `, link => {
    readline.close();
    let url = new URL(link);
    let scraper = scrapers.find(s => url.host === s.domain);
    if (scraper) {
        console.log(`Scraping ${scraper.name}..`);
        scraper.scrape(link);
    } else {
        console.log(`No scraper found for ${url.host}`);
    }
});
