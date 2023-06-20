import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from "../models/Usuario.js"
import { generarId } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', { //'auth/login' es la vista
        pagina: 'Log in'
    })
}

const formularioRegistro = (req, res) => {

    console.log(req.csrfToken())//solo se activa en index.js y ya se usa aca

    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
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
        /* console.log("usuario registrado ya") */
        //Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
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
            csrfToken: req.csrfToken(),
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
    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //Confirmar la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()

    return res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmó correctamente'

    })


}


const formularioOlvidePassword = (req, res) => {
    res.render('auth/restaurar-password', {
        pagina: 'Restaurar Cuenta',
        csrfToken: req.csrfToken()
    })
}


const resetPassword = async (req, res) => {
    //Para leer la info de un form en express siempre se usa req.body


    //Validación 
    await check('email').isEmail().withMessage('El formato del email no es valido').run(req)


    let resultado = validationResult(req)


    //Verificar que el arr de errores usuario esté vacio
    if (!resultado.isEmpty()) {

        //Errores
        return res.render('auth/restaurar-password', {
            pagina: 'Restaurar Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array()

        })
    }

    //Buscar el usuario

    const { email } = req.body

    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/restaurar-password', {
            pagina: 'Restaurar Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El email no pertenece a ningun usuario' }]

        })
    }

    //Generar un token y enviar el email
    usuario.token = generarId()

    //Guardamos el usuario con el token en la bd
    await usuario.save()

    //Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Renderizar un mensaje
    res.render('templates/mensaje', {    //'templates/mensaje' es la view, es mensaje.pug 
        pagina: 'Restablece tu password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

const comprobarToken = async (req, res) => {
    const { token } = req.params

    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    // Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Resetear Password',
        csrfToken: req.csrfToken()
    })

}

const nuevoPassword = async (req, res) => {

    // Validar el password
    await check('password').isLength({ min: 6 }).withMessage('El password debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los password no son iguales').run(req)

    let resultado = validationResult(req)

    //Verificar que el arr de errores usuario esté vacio
    if (!resultado.isEmpty()) {

        //Errores
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu pasword',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const { token } = req.params
    const { password } = req.body

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({ where: { token } })


    // Hashear el password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null //Hago que no este disponible el token

    //Como manda un mail para reescribir la cuenta si no esta confirmado aprovecho y lo confirmo, total ya entro al mail
    if (!usuario.confirmado) {
        usuario.confirmado = true
    }


    await usuario.save()

    res.render('auth/confirmar-cuenta',{
        pagina: 'Password Reestablecido',
        mensaje: 'El password se modificó correctamente'
    })
}


export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}