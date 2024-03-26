// list all scraper modules here

// every scraper object should have a name, domain and associated JS file
// the caller will fork a scraper process and initiate the scrape
// via IPC

module.exports = [{
    name: "toonily.com scraper",
    domain: "toonily.com",
    file: "toonily.js"
}]
