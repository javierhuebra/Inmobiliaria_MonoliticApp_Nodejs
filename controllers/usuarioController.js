import { check, validationResult } from 'express-validator'
import Usuario from "../models/Usuario.js"

const formularioLogin = (req,res) => {
    res.render('auth/login', { //'auth/login' es la vista
        pagina: 'Log in'
    })
}

const formularioRegistro= (req,res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    })
}

const registrar = async(req, res) => {
    //Para leer la info de un form en express siempre se usa req.body
    

    //Validación (express validator ya trae las reglas)
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('El formato del email no es valido').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals('password').withMessage('Los password no son iguales').run(req)

    let resultado = validationResult(req)


    //Verificar que el arr de errores usuario esté vacio
    if(!resultado.isEmpty()){
        
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


    res.json(resultado.array())


    const usuario = await Usuario.create(req.body)

    res.json(usuario) //mando una respuesta en json con los datos que se crearon
}


const formularioOlvidePassword= (req,res) => {
    res.render('auth/restaurar-password', {
        pagina: 'Restaurar Cuenta'
    })
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    formularioOlvidePassword
}