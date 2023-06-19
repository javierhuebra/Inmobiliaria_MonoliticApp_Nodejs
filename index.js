//const express = require('express') //CommonJSser
import express from 'express' //ECMASCRIPT MODULE
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js' //Tiene que tener el .js
import db from './config/db.js'

// Crear la app
const app = express()

//Habilitar lectura de datos de formularios
app.use( express.urlencoded({extended: true}))

//Habilitar cookie parser
app.use( cookieParser() )

//Habilitar el CSRF 
app.use( csrf({cookie: true}) )

//Conexion a la base de datos
try{
    await db.authenticate()
    db.sync() //Para crear la tabla si no existe creo que es esto
    console.log("Conexion correcta a la base de datos")

}catch(error){
    console.log(error)
}

// Habilitar Pug para que detecte donde estan las views y el tipo de template engine
app.set('view engine', 'pug')
app.set('views','./views')

// Carpeta pública
app.use( express.static('public') )

// Routing
app.use('/auth', usuarioRoutes)



// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000

app.listen(port, ()=> {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})


//Con app.get('/') espera una unica ruta, con use todas