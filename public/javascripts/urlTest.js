
function loadPage(url) {
    var http = require('http');
    var https = require("https");  
        if(url.substring(0,5) === 'https')
    {
        //console.log(url.substring(0,5))
        var pm = new Promise(function (resolve, reject) {
            https.get(url, function (res) {
               if(res){
                   console.log(res.statusCode)
                if(res.statusCode === 200)
                resolve(true);
                else 
               resolve(false)
               }
            }).on('error', function (e) {
                resolve(false)
            });
        });
    }
    else{
         pm = new Promise(function (resolve, reject) {
            http.get(url, function (res) {
               if(res){
                   console.log(res)
                if(res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302)
                resolve(true);
                else 
               resolve(false)
               }
            }).on('error', function (e) {
                resolve(false)
            });
        });
    }
    return pm;
} 
loadPage('https://www.youku.com/favicon.ico').then(function (d) {
   // console.log(d);
});

module.exports = { loadPage } ;