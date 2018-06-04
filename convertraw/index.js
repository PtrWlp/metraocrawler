'use strict';

var fs = require('fs-extra');

var raw = fs.readFileSync('./convertraw/input.raw').toString('utf-8');
// Repair the json errors
raw = raw.replace(/data: d(\d) =/g, '"data":').replace(/data: d(\d\d) =/g, '"data":');
function fixkeys(input) {
    var result = input.replace(/label:/g, '"label":');
    result = result.replace(/color:/g, '"a":'); // not important
    result = result.replace(/lines:/g, '"b":');
    result = result.replace(/show:/g, '"c":');
    result = result.replace(/lineWidth:/g, '"d":');
    result = result.replace(/shadowSize:/g, '"e":');
    
    // Metrao adds a superflouus comma at the end.. sadly.
    result = result.replace(/  /g, ' ');
    result = result.replace(/]] }, \n ]/, ']] } ]');
    return result;
}

var inputData = JSON.parse(fixkeys(raw));

var outfile = `./convertraw/measures.csv`;
console.log('Collecting and writing to ', outfile);

function time_format(d) {
    function format_two_digits(n) { return n < 10 ? '0' + n : n;}
    return format_two_digits(d.getHours()) + ":" + format_two_digits(d.getMinutes());
}

var measurements = {};
var streamlabels = [];

// Obtain unique timestamps
inputData.forEach(stream => {
    streamlabels.push(stream.label);
    stream.data.forEach(measure => {
        // correct 2 hours for utc
        var time = time_format(new Date(measure[0] - 1000*3600*2));
        if (measurements[time]) {
            measurements[time].push(measure[1]);
        } else {
            measurements[time] = [measure[1]];
        }
    })
});

// Write headers
var labelLine = 'time,' + streamlabels.join(',');
console.log(labelLine);
fs.outputFile(outfile, labelLine + '\n', function (err) {if (err) throw err;}); 
// Write data
Object.keys(measurements).forEach(time => {
    var timeLine = time + ',' + measurements[time].join(',');
    console.log(timeLine);
    fs.appendFile(outfile, timeLine + '\n', function (err) {
    });
});

