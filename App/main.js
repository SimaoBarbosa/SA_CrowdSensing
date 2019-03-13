var http = require('http')
var url = require('url')
var pug = require('pug')

http.createServer((req,res)=>{
    var ourl = url.parse(req.url)
    if(ourl.pathname == '/'||ourl.pathname == '/index'){
        
        var salas = ["sala1 : 20/30", "sala2 : 30/30"]
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