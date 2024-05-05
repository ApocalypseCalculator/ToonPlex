const puppeteer = require('puppeteer-extra').default;
const fs = require('fs');
const axios = require('axios').default;

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

process.on('message', async (msg) => {
    // console.log('Message received', msg);
    if (msg.command === 'scrape') {
        process.send({
            event: 'log',
            data: `Scraping ${msg.data.url}...`
        })
        await scrape(msg.data.url);
    }
});

async function scrape(url) {
    const browser = await puppeteer.launch({ headless: true });

    process.send({
        event: 'log',
        data: `Creating puppeteer browser instance...`
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", req => {
        if (isBlocked(req.url())) {
            //console.log(`Blocked ${req.url()}`);
            req.abort();
        }
        else {
            req.continue();
        }
    });
    await page.goto(url);
    await page.waitForNetworkIdle({ idleTime: 500 });
    await page.setCookie({
        name: 'toonily-lazyload',
        value: 'off'
    }, {
        name: 'toonily-mature',
        value: '1'
    });

    process.send({
        event: 'log',
        data: `Crawling chapter directory...`
    });

    // await page.screenshot({ path: 'testresult.png', fullPage: true });
    let data = await page.evaluate(() => {
        let result = [];
        document.querySelectorAll('.wp-manga-chapter').forEach(e => {
            result.push({
                title: e.children[0].text.trim(),
                link: e.children[0].href,
                date: e.children[1].innerText.trim()
            })
        });
        let title = document.querySelector('.post-title > h1').firstChild.textContent.trim();
        let summary = document.querySelector('.summary__content').innerText.trim();
        let alttitle = document.querySelector('.manga-info-row > .post-content_item > .summary-content').innerText.trim();
        let authorlst = document.querySelector('.manga-info-row > .post-content_item > .summary-content > .author-content').children;
        let authors = [];
        for (let i = 0; i < authorlst.length; i++) {
            authors.push(authorlst.item(i).innerText.trim());
        }
        let artistlst = document.querySelector('.manga-info-row > .post-content_item > .summary-content > .artist-content').children;
        let artists = [];
        for (let i = 0; i < artistlst.length; i++) {
            artists.push(artistlst.item(i).innerText.trim());
        }
        let genrelst = document.querySelector('.manga-info-row > .post-content_item > .summary-content > .genres-content').children;
        let genres = [];
        for (let i = 0; i < genrelst.length; i++) {
            genres.push(genrelst.item(i).innerText.trim());
        }
        let tagslst = document.querySelectorAll('.wp-manga-tags-list > a');
        let tags = [];
        for (let i = 0; i < tagslst.length; i++) {
            tags.push(tagslst.item(i).innerText.trim());
        }

        let coversrc = document.querySelector('.summary_image > a > img').src

        return {
            details: {
                title: title,
                summary: summary,
                alttitle: alttitle,
                authors: authors,
                artists: artists,
                genres: genres,
                tags: tags
            },
            chapters: result.reverse(),
            coversrc: coversrc
        };
    });

    // TODO: add toon status

    process.send({
        event: 'toon',
        data: {
            ...data.details,
            slug: getLastSection(url),
            ext: getExtension(getLastSection(data.coversrc))
        }
    });

    const toondir = `${process.env.DOWNLOADPATH}/${getLastSection(url)}`;
    if (!fs.existsSync(toondir)) {
        fs.mkdirSync(toondir);
        process.send({
            event: 'log',
            data: `Created directory for toon at ${toondir}`
        });
    }

    axios.get(data.coversrc, { responseType: 'stream' }).then(res => {
        let coverpath = `${toondir}/cover.${getExtension(getLastSection(data.coversrc))}`;
        res.data.pipe(fs.createWriteStream(coverpath));
        res.data.on('end', () => {
            process.send({
                event: 'cover',
                data: {
                    path: coverpath
                }
            });
        });
    });

    process.send({
        event: 'log',
        data: `Starting download of ${data.chapters.length} chapters...`
    });

    for (let i = 0; i < data.chapters.length; i++) {
        let chapter = data.chapters[i];
        let cresult = await downloadChapter(chapter.link, browser, toondir);

        process.send({
            event: 'log',
            data: `Downloaded ${chapter.title} with ${cresult.list.length} pages`
        });

        // parent sends chapter create request
        process.send({
            event: 'chapter',
            data: {
                name: chapter.title,
                date: chapter.date,
                order: i + 1,
                pages: cresult.list.length,
                ext: getExtension(cresult.list[0])
            }
        });
        for (let j = 0; j < cresult.list.length; j++) {
            // parent sends image upload request
            process.send({
                event: 'image',
                data: {
                    path: `${cresult.chapterdir}/${cresult.list[j]}`,
                    page: j,
                    chapter: i + 1
                }
            });
        }
    }
    await sleep(2000);
    await browser.close();

    process.send({
        event: 'log',
        data: `All done ✨`
    });
    process.exit(0);
}

async function downloadChapter(url, browser, toondir) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let chapterdir = `${toondir}/${getLastSection(url)}`;
    if (!fs.existsSync(chapterdir)) {
        process.send({
            event: 'log',
            data: `Created directory for chapter at ${chapterdir}`
        });

        fs.mkdirSync(chapterdir);
    }
    let list = [];
    page.on('response', (res) => {
        let name = getLastSection(res.url());
        // match image downloads only
        if (/\.(png|jpg|jpeg|webp|PNG|JPG|JPEG|WEBP|tiff|TIFF)$/.test(name) && res.url().includes("cdn.toonily.com/chapters/")) {
            // save buffered image to disk
            res.buffer().then(buf => {
                fs.writeFileSync(`${chapterdir}/${name}`, buf);
                list.push(name);
            }).catch(err => {
                console.log(err);
            })
        }
    });
    page.on('request', (req) => {
        req.continue();
    });

    await page.goto(url, { waitUntil: "networkidle0" });
    await sleep(2000);
    // retrieve the correctly ordered page sources, and sort our downloaded list accordingly
    // also serves as a half check that we downloaded the correct content
    let orderedpagesrc = await page.evaluate(() => {
        let pages = document.querySelectorAll('.page-break > .wp-manga-chapter-img');
        let result = [];
        for (let i = 0; i < pages.length; i++) {
            result.push(pages.item(i).src.trim());
        }
        return result;
    });

    orderedpagesrc = orderedpagesrc.filter((src) =>
        /\.(png|jpg|webp)$/.test(getLastSection(src)) && src.includes("cdn.toonily.com/chapters/") && list.includes(getLastSection(src))
    );

    orderedpagesrc = orderedpagesrc.map((src) => { return getLastSection(src) });

    await sleep(500);
    await page.close();
    return {
        chapterdir: chapterdir,
        list: orderedpagesrc
    };
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

function getLastSection(url) {
    let removed = url.replace(/\/$/, '');
    return (removed.substr(removed.lastIndexOf('/') + 1));
}

function getExtension(name) {
    return name.split('.').pop();
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
