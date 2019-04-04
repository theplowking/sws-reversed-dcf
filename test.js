var rp = require('request-promise');

rp('http://www.example.com')
    .then(function (htmlString) {
        console.log(htmlString);
    })
    .catch(function (err) {
        // Crawling failed...
    });