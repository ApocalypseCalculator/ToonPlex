# ToonPlex

A host webtoons/manga and an accompanying scraper that uploads to your ToonPlex server. 


## Introduction

I got tired of having to update my adblock frequently and sometimes the sites go down or load really slowly. 
(I'd still recommend using those sites, but this is good if you'd like to maintain your own collection.) 


Now you can scrape the manhwa/manga/manhua automagically using the scripts provided in `scrapers/suite` which upload the scraped content 
to the server, then you can read it in your browser, so that you control the content. 


This project comes with 3 distinct codebases: 
- server: this is the Express.js web backend that hosts and serves the webtoon content
- client: this is the React.js web frontend that interacts with the backend to display webtoon content
- scraper: this is the scraper terminal application (ideally run on a PC able to run Chromium) that scrapes the webtoon at a given URL and uploads it to the backend


The design choice to have scrapers be run on the end user machine
(as opposed to a background process on the server) is twofold: scraping via automating 
a browser on a legitimate user device evades bot detection algorithms like Cloudflare, and 
forcing the user to initiate the scrape themselves prevent massive spam on the unsuspecting original host. 


A major downside to this system is that, since each webtoon site hosts content in a slightly different manner, 
a dedicated scraper script (which can be broken at any moment with a slight modification to the site)
must be customized extensively for each particular site. Thus, I will initially provide only one scraper script
for one of the larger libraries of "free" (read: possibly pirated) webtoons. I will add more as 
I ... discover new content. The general scraper module's IPC calls are documented below. If you 
would like to add a scraper script, feel free to submit a PR. 


## Install
Ideally some things you should have: 
- PostgreSQL database
- A reverse proxy
- Enough storage for your content

Simply clone this repository and install dependencies under each codebase using `npm install`.
Build the client by running `npx vite build` in the `client` folder, and initialize 
the database by running `npx prisma db push` in the `server` folder. 

The server and scraper are both started by using `node .` in their folders. 

## Required Configuration
Server and scraper both require a `.env` file to be present in their respective directories: 
Server requires: 
```
DB_URL: the URL to the Postgres database
JWTSECRET: the secret for JWT verification
PORT: the port to run the server on
```
Scraper requires: 
```
HOST: the host of the server (include scheme and origin, e.g. http://127.0.0.1:8080)
DOWNLOADPATH: the path to download images to (e.g. ./tmp)
```


## Creating Custom Scraper Script

Note: if your scraper is getting flagged by bot detection software, turn off headless mode and monitor the scrape. 
after this, you should be able to use headless mode for a while. 

1. Create a script file under `scrapers/suite`
2. Inside `/scrapers/suite/index.js`, create a new object entry containing the name, file name, and targeted host for the scraper
3. Write your script! The scraper will automatically fork your script as a child process after matching the host. The script should listen to / dispatch the following IPC messages: 

| Message | Description |
| --- | --- |
| `{command: "scrape"}` | Dispatched by the main scraper, the script should initiate the scrape upon receiving this message |
| `{event: "log", data: string}` | Send this message for the main scraper to write to console under the process pid, recommended to use over `console.log` |
| `{event: "toon", data: {title: string, summary: string, alttitle: string, authors: array, artists: array, genres: array, tags: array, slug: string, ext: string}}` | Send this message with the data as soon as the toon details have been scraped |
| `{event: "cover", data: {path: string}}` | Send this message to queue upload of the cover image for this toon |
| `{event: "chapter", data: {name: string, date: string, order: number, pages: number, ext: string}}` | Send this message to create a record for the chapter |
| `{event: "image", data: {path: string, page: number, chapter: number}}` | Send this message to queue upload of a content image for a specific chapter's page |

The scraper will process requests in a queue, since some requests are dependent on the successful completion of others (e.g. cover image upload depends on a toon record existing first). 
