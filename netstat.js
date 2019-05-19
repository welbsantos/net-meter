const { exec } = require('child_process');

const segundos = 1;
const kilobytes = 1024;
const megabytes = 1024 * kilobytes;

var intervalo = segundos * 1000;
var bytes_in_anterior = 0;
var bytes_out_anterior = 0;
var bytes_in = 0;
var bytes_out = 0;
var max_velocidade_in = 0;
var max_velocidade_out = 0;
var perc_max_velocidade_in = 0;
var perc_max_velocidade_out = 0;

function executa () {

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

        if (bytes_in_anterior == 0) {
            bytes_in_anterior = bytes_in;
        }

        if (bytes_out_anterior == 0) {
            bytes_out_anterior = bytes_out;
        }

        velocidade_in = (bytes_in - bytes_in_anterior);
        velocidade_out = (bytes_out - bytes_out_anterior);

        bytes_in_anterior = bytes_in;
        bytes_out_anterior = bytes_out;

        if (velocidade_in > max_velocidade_in) {
            max_velocidade_in = velocidade_in;
        }

        if (velocidade_out > max_velocidade_out) {
            max_velocidade_out = velocidade_out;
        }

        perc_max_velocidade_in = Math.round((velocidade_in * 100) / max_velocidade_in);
        perc_max_velocidade_out = Math.round((velocidade_out * 100) / max_velocidade_out);

        console.log ("Total de bytes in : " + bytes_in);
        console.log ("Total de bytes out : " + bytes_out);
        console.log ("Velocidade em bytes/sec in : " + velocidade_in / segundos + " (" + perc_max_velocidade_in + "% da velocidade maxima)");
        console.log ("Velocidade em bytes/sec out : " + velocidade_out / segundos + " (" + perc_max_velocidade_out + "% da velocidade maxima)");
        console.log ("Velocidade em Kbytes/sec in : " + velocidade_in / kilobytes / segundos);
        console.log ("Velocidade em Kbytes/sec out : " + velocidade_out / kilobytes / segundos);
        console.log ("Velocidade em Mbytes/sec in : " + velocidade_in / megabytes / segundos);
        console.log ("Velocidade em Mbytes/sec out : " + velocidade_out / megabytes / segundos);

        console.log ("Max bytes/sec in : " + max_velocidade_in / segundos);
        console.log ("Max bytes/sec out : " + max_velocidade_out / segundos);

        console.log ("Max Mbytes/sec in : " + max_velocidade_in / megabytes / segundos);
        console.log ("Max Mbytes/sec out : " + max_velocidade_out / megabytes / segundos);
         
        console.log ("\n");

    });

}

setInterval (executa, intervalo);
