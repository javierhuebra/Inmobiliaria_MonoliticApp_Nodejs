//const express = require('express') //CommonJSser
import express from 'express' //ECMASCRIPT MODULE
import usuarioRoutes from './routes/usuarioRoutes.js' //Tiene que tener el .js

// Crear la app
const app = express()

// Habilitar Pug para que detecte donde estan las views y el tipo de template engine
app.set('view engine', 'pug')
app.set('views','./views')

// Routing
app.use('/auth', usuarioRoutes)



// Definir un puerto y arrancar el proyecto
const port = 3000

app.listen(port, ()=> {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})


//Con app.get('/') espera una unica ruta, con use todas