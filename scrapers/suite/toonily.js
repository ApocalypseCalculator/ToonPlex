const puppeteer = require('puppeteer-extra').default;

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

module.exports = {
    name: "toonily.com scraper",
    domain: "toonily.com",
    scrape: scrape
}

async function scrape(url) {
    const browser = await puppeteer.launch({ headless: true });

    console.log('Running tests..')
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", req => {
        if (isBlocked(req.url())) {
            console.log(`Blocked ${req.url()}`);
            req.abort();
        }
        else {
            req.continue();
        }
    });
    await page.goto(url);
    await page.waitForNetworkIdle({ idleTime: 500 });
    await page.screenshot({ path: 'testresult.png', fullPage: true });
    let data = await page.evaluate(() => {
        let result = [];
        document.querySelectorAll('.wp-manga-chapter').forEach(e => {
            result.push({
                title: e.children[0].text.trim(),
                link: e.children[0].href
            })
        });
        return result;
    });
    console.log(data);
    await browser.close();

    console.log(`All done, check the screenshot. ✨`);
}

const blockedURLs = ["wp-content/plugins/advanced-ads-pro", "wp-content/plugins/advanced-ads", "wp-content/plugins/additional-ad", "wp-content/plugins/advanced-ads-sticky-ads"];
function isBlocked(url) {
    for (let i = 0; i < blockedURLs.length; i++) {
        if (url.includes(blockedURLs[i])) {
            return true;
        }
    }
    return false;
}
