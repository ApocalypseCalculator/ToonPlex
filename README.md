# ToonPlex

A site to scrape and host webtoons/manga. 


I got tired of having to update my adblock frequently and sometimes the sites go down or load really slowly. 


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
I ... discover new content. I will document the general scraper module's IPC calls in more depth soon. If you 
would like to add a scraper script, feel free to submit a PR. 
