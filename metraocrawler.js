'use strict';

var requestP = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs');

var uri = 'http://data3.eventacoustics.nl/elka31/n1kavel/live_per_station_graphdraw_public_enm.inc.php';
var outfile = `output/metraocrawler.csv`;
var interval = 3; // minutes 

fs.writeFile(outfile, 'header;column', function (err) {
    if (err) throw err;
});

function getMeasure() {
    
    requestP(uriPlusOption(uri))
    .then(function ($) {

        var measures = $('.col_3.center > fieldset');
        measures.map(function() {
            var measure = $(this).html();
            // console.log($(this).html());
            // TODO parse into csv
            fs.appendFile(outfile, measure, function (err) {
            });
            return $(this).text();
        }).toArray();

              
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked... 
        console.log('error index: ', err);
        // or end of list
    });

}

function uriPlusOption(uri) {
    // directly parse into cheerio objects.
    return  {
        uri: uri,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
}

function trigger() {
    getMeasure();
}
// initial and every n minutes ( depends on interval, usually 5 or 3 )
getMeasure();
setInterval(trigger, interval*60000);
