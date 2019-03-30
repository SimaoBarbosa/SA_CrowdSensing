var http = require('http')
var url = require('url')
var pug = require('pug')
var firebase = require('firebase')
var axios = require('axios')
var fs = require("fs")

http.createServer((req,res)=>{
    var ourl = url.parse(req.url)
    var regexImg = new RegExp("images/", 'i')
    if(ourl.pathname == '/'||ourl.pathname == '/index'){
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

        
        
        res.writeHead(200,{'Content-Type': 'text/html'})

        // Recolha de dados da BD da firebase
        console.log("HTTP Get Request");
        var userReference = firebase.database().ref("/ProbeData/");
        userReference.on("value", 
                  function(snapshot) {
                        var dados_tratados = new Map();
                        var macs_aceites = new Map();
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
                        var limit_rssi = -80
                        var n_apple = 0
                        var j = 0   
                        var mobiles = ["mobile","samsung","tct","liteon","huawei","xiaomi","motorola","sony","plus-one","alcatel"]  
                        dados_tratados.forEach(mac => {
                           // console.log(mac.mac)
                            axios.get('http://macvendors.co/api/' + mac.mac + "/json")
                                .then(vendor => {
                                    j=j+1
                                    var marcaDet =  vendor.data.result.company
                                    for(var a = 0; a < mobiles.length; a++)  {
                                        var regex = new RegExp(mobiles[a], 'i')
                                        var regexApple = new RegExp("apple", 'i')

                                        var testaRSSIeVendor =(regex.test(marcaDet) || (!marcaDet) )   && mac.rssi > limit_rssi

                                        if(testaRSSIeVendor) {

                                       //     console.log(marcaDet) 
                                        //    console.log(mac.rssi)
                                            mac.vendor = marcaDet
                                            macs_aceites.set(mac.mac,mac)
                                            
                                        }
                                     //   else dados_tratados.delete(mac)
                                    }
                                    if(regexApple.test(marcaDet) && mac.rssi > limit_rssi ){
                                        console.log(marcaDet);
                                        
                                        n_apple=n_apple+1
                                    }
                                    if (j==dados_tratados.size) {
                                        
                                        console.dir(macs_aceites);
                                        
                                        console.log("N_apples : "+ n_apple );
                                        
                                        var apples_telemóveis =  Math.round(n_apple/4)
                                        console.log("final: " + (macs_aceites.size + apples_telemóveis));
                                        
                                        var n_pessoas = macs_aceites.size + apples_telemóveis
                                        var img =""
                                        if (n_pessoas<15)
                                            img = "images/Green.gif"
                                        else{
                                             if(n_pessoas<30)
                                                img = "images/Yellow.gif"
                                             else
                                                img = "images/Red.gif"
                                        }
                                        var ocupacao = Math.round((n_pessoas/35)*100)
                                        if (ocupacao>100) ocupacao =100
                                        var sala = "Ocupação sala aberta DI : "+ ocupacao + "%" 
                                        res.write(pug.renderFile('page.pug',{sala: sala ,img : img}))
                                        res.end()
                                    }
                                    
                                })
                                .catch(error => res.render('error', { e: error }))
                        })
                    }, 
                  function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                 });


        
    }
    else if(regexImg.test( ourl.pathname) ){
        console.log("Get Images!!");
        
        fs.readFile( "."+req.url ,(erro2,dados)=>{
            
            if(!erro2){
                res.writeHead(200,{'Content-Type': 'image/gif'})
                
                res.write(dados)
                res.end()
            }
            else{
                console.log("Erro ler BD!"+ erro2)
                res.end()
            }
        })
    }
    else {
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