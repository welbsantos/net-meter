const { exec } = require('child_process');

var bytes_in = 0;
var bytes_out = 0;
var statistics = {};

function getStatistics() {

    exec('netstat -b -I en0', (err, stdout, stderr) => {

        if (err) {
            console.log ("Error :" + err);
            return;
        }

        retorno = stdout.split(" ");

        var filtered = retorno.filter(function(value, index, arr){
            return value != '';
        });

        bytes_in = filtered [16]; // Ibytes
        bytes_out = filtered [19]; // Obytes

        statistics.bytes_in = bytes_in;
        statistics.bytes_out = bytes_out;
        //console.log (statistics);
        return statistics;

    })
}

module.exports = getStatistics;