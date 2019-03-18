var http = require('http')
var url = require('url')
var pug = require('pug')
var firebase = require('firebase')
var axios = require('axios')


http.createServer((req,res)=>{
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDHVN5SqH3YanLDsn_wxb2IDjoBZKNvpn0",
        authDomain: "sa1819.firebaseapp.com",
        databaseURL: "https://sa1819.firebaseio.com",
        projectId: "sa1819",
        storageBucket: "sa1819.appspot.com",
        messagingSenderId: "618709967178"
    };
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }

    
    var ourl = url.parse(req.url)
    if(ourl.pathname == '/'||ourl.pathname == '/index'){
        
        
        res.writeHead(200,{'Content-Type': 'text/html'})

        // Recolha de dados da BD da firebase
        console.log("HTTP Get Request");
        var userReference = firebase.database().ref("/ProbeData/");
        userReference.on("value", 
                  function(snapshot) {
                        var dados_tratados = new Map();
                        var data = snapshotToArray(snapshot)
                        console.log("Número de timestamps:" + data.length)
                        var number = 0
                        for ( x in data ) {
                            if (x> data.length - 10 ) {
                                number++
                                for (y in data[x].probes)
                                    dados_tratados.set(data[x].probes[y].mac, data[x].probes[y])
                            }
                        }
                        //console.dir(dados_tratados)
                        console.log("Número de timestamps tratados: " + number)
                        console.log("Número de macs: " +  dados_tratados.size)
                        userReference.off("value");
                        var j = 0
                        var people_on_room = 0    
                        var mobiles = ["mobile","samsung","tct","liteon","huawei","xiaomi","motorola","sony","plus-one","alcatel"]  
                        dados_tratados.forEach(mac => {
                           // console.log(mac.mac)
                            axios.get('http://macvendors.co/api/' + mac.mac + "/json")
                                .then(vendor => {
                                    j=j+1
                                    var marcaDet =  vendor.data.result.company
                                    for(var a = 0; a < mobiles.length; a++)  {
                                        var regex = new RegExp(mobiles[a], 'i')
                                        if(regex.test(marcaDet) && mac.rssi > -80 ) {
                                            console.log(marcaDet) 
                                            console.log(mac.rssi)
                                            people_on_room=people_on_room+1
                                            
                                        }
                                        else dados_tratados.delete(mac)
                                    }
                                    if (j==dados_tratados.size) {
                                        console.log("final: " + people_on_room);
                                        var salas = ["Sala aberta DI : "+ people_on_room ]
                                        res.write(pug.renderFile('page.pug',{salas: salas }))
                                        res.end()
                                    }
                                    
                                })
                                .catch(error => res.render('error', { e: error }))
                        })
                    }, 
                  function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                 });


        
   //     res.end()  
    }
    else{
        res.writeHead(200,{'Content-Type': 'text/html'})
        res.write(pug.renderFile('erro.pug',{e:"Pedido desconhecido:" + ourl.pathname}))
        res.write('<p><b>Erro, pedido desconhecido: </b> ' + ourl.pathname + '</p>')
        res.end()
    }

}).listen(5555, ()=>{
    console.log('Servidor á escuta na porta 5555...')
})

function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};