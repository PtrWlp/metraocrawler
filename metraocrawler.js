'use strict';

var requestP = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs-extra');
var requestSync = require('sync-request');
var get = require('lodash.get');
           
var uri = 'http://data3.eventacoustics.nl/elka31/amsterdam/live_per_station_graphdraw_calc.inc.php';

var d = new Date().toISOString().slice(0,17).replace(/-/g,"").replace(/:/g,"").replace("T","-");
var outfile = `output/metraocrawler-${d}.csv`;
var interval = 1; // minutes 
var headerHelper = true;

var knmiApiKey = '6772068fdf';
var knmiLocation = 'Halfweg';
var knmiUrl = `http://weerlive.nl/api/json-data-10min.php?key=${knmiApiKey}&locatie=${knmiLocation}`;

console.log('Collecting and writing to ', outfile);
console.log('Weather location:', knmiLocation);
console.log('Quit with CTRL-C');

function getMeasure(onetwothree) {

    if (headerHelper) {
        headerHelper = false;
        // write header once
        fs.outputFile(outfile, 'measurepoint,timestamp,dBA,dBC,norm,winddir,windspeed,temp,n\n', function (err) {
            if (err) throw err;
        });
    }

    requestP(uriPlusOption(uri))
    .then(function ($) {
        var res = requestSync('GET', knmiUrl);
        var weather = JSON.parse(res.getBody('utf8'));
        var temperature = get(weather, 'liveweer[0].temp', '?');
        var winddir = get(weather, 'liveweer[0].windr', '?');
        var windspeed = get(weather, 'liveweer[0].windms', '?');
        var closingcolumns = `${winddir},${windspeed},${temperature},${onetwothree}`;

        var measures = $('.col_3.center > fieldset');
        measures.map(function() {
            var measure = $(this).html();
            var measurepoint = $(this).find('fieldset h4').text();
            var timestamp = $(this).find('fieldset h6').text().substr(11,5);
            var decibels = $(this).find('table tr td h10').toArray();
            var dBA = $(decibels[1]).text();
            var dBC = $(decibels[3]).text();
            var norm = $(decibels[5]).text();
            
            fs.appendFile(outfile, `${measurepoint},${timestamp},${dBA},${dBC},${norm},${closingcolumns}\n`, function (err) {
            });
            return $(this).text();
        });

              
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked... 
        console.log(err);
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

var onetwothree = 1; // deduplicate if we only get 1 measure every 3 minutes.
function trigger() {
    onetwothree += 1;
    if (onetwothree === 4) {
        onetwothree = 1;
    }
    getMeasure(onetwothree);
}
// initial and every n minutes ( depends on interval, usually 5 or 3 )
getMeasure(onetwothree);
setInterval(trigger, interval*60000);
