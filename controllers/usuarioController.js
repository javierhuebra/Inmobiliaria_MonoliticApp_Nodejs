import { check, validationResult } from 'express-validator'
import Usuario from "../models/Usuario.js"
import { generarId } from '../helpers/tokens.js'
import { emailRegistro } from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', { //'auth/login' es la vista
        pagina: 'Log in'
    })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    })
}

const registrar = async (req, res) => {
    //Para leer la info de un form en express siempre se usa req.body

    //Extraer ñps datps
    const { nombre, email, password } = req.body

    //Validación (express validator ya trae las reglas)
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('El formato del email no es valido').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(password).withMessage('Los password no son iguales').run(req)

    let resultado = validationResult(req)


    //Verificar que el arr de errores usuario esté vacio
    if (!resultado.isEmpty()) {
        console.log("usuario registrado ya")
        //Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }


    //res.json(resultado.array())

    


    //Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where: { email: email } })


    if (existeUsuario) {
        console.log(existeUsuario)

        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{ msg: 'El usuario ya esta registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
         
    }



    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })


    //Envía email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })


    //Mostrar mensaje de confirmación
    res.render('templates/mensaje', {    //'templates/mensaje' es la view, es mensaje.pug 
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de confirmación, presiona en el enlace.'
    })

}

//Funcion que comprueba una cuenta de usuario
const confirmar = async (req, res) => {
    const { token } = req.params
    

    //Verificar si el token es válido
    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //Confirmar la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()

    return res.render('auth/confirmar-cuenta',{
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmó correctamente'
        
    })

    
}


const formularioOlvidePassword = (req, res) => {
    res.render('auth/restaurar-password', { 
        pagina: 'Restaurar Cuenta'
    })
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword
}