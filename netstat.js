const { execSync } = require('child_process');

var bytes_in = 0;
var bytes_out = 0;
var statistics = {};
var buffer;
var bufferStr;
var retorno;

function getStatistics() {

    try {
        buffer = execSync('netstat -b -I en0');
    } catch (err) {
        console.log("Error :" + err);
        return;
    }

    bufferStr = buffer.toString();
    retorno = bufferStr.split(" ");
    
    var filtered = retorno.filter(function(value, index, arr){
        return value != '';
    });

    bytes_in = filtered [16]; // Ibytes
    bytes_out = filtered [19]; // Obytes

    statistics.bytes_in = bytes_in;
    statistics.bytes_out = bytes_out;
    
    return statistics;
}

module.exports = { getStatistics };