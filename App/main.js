var http = require('http')
var url = require('url')
var pug = require('pug')
var firebase = require('firebase')

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
        

        // Recolha de dados da BD da firebase
        console.log("HTTP Get Request");
        var userReference = firebase.database().ref("/ProbeData/");
        userReference.on("value", 
                  function(snapshot) {
                        console.log(snapshot.val());
                     //   res.json(snapshot.val());
                        userReference.off("value");
                        }, 
                  function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                      //  res.write("The read failed: " + errorObject.code);
                 });
        


        var salas = ["sala1 : 20/30", "sala2 : 30/30"]  //exemplo
        res.writeHead(200,{'Content-Type': 'text/html'})
        res.write(pug.renderFile('page.pug',{salas: salas }))
        res.end()  
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