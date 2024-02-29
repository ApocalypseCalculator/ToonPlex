const puppeteer = require('puppeteer');
const prisma = require('@prisma/client');

module.exports = {
    name: "toonily.com scraper",
    domain: "toonily.com",
    scrape: scrape
}

async function scrape(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
}