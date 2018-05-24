const fs = require('fs');
const Crawler = require("crawler");
const stringify = require('csv-stringify');
const date = new Date().toISOString().slice(0, 10);

/* ---------- NOTES ----------
    Scaper: https://www.npmjs.com/package/crawler,
            https://www.npmjs.com/package/metascraper,

    JSON to CSV: https://www.npmjs.com/package/json2csv
*/

// Creates the "data" directory if it 
// doesn't exist already
!fs.existsSync('./data') ? 
    fs.mkdirSync('./data') : null;

fs.writeFileSync(`./data/${date}.csv`,"Title,Price,ImageURL,URL,Time\n");


const shirts = new Crawler({
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            
            let shirt = [];
            let img = $(".shirt-picture img")[0];
            let price = $('.price').text();
            let time = new Date().toUTCString().slice(17);

            shirt.push(img.attribs.alt);
            shirt.push(price.slice(1));
            shirt.push(`http://www.shirts4mike.com/${img.attribs.src}`);
            shirt.push(res.options.uri);
            shirt.push(time);

            stringify([shirt], (err, output) => {
                fs.appendFileSync(`./data/${date}.csv`,output);
            });
        }
        done();
    }
})

const scraper = new Crawler({
    //maxConnections: 10,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
            fs.appendFileSync('scraper-error.log',`${new Date()} ${error} \n`);
        } else {
            const $ = res.$;
            const links = $(".products a");
           
            for (let link in links) {
                if (links[link].type === "tag") {
                    let id = links[link].attribs.href;
                    let url =(`http://www.shirts4mike.com/${id}`)
                    shirts.queue(url);
                }
            }
        }
        done();
    }
});

scraper.queue('http://shirts4mike.com/shirts.php');