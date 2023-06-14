

const formularioLogin = (req,res) => {
    res.render('auth/login', { //'auth/login' es la vista
        
    })
}

const formularioRegistro= (req,res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    })
}

export {
    formularioLogin,
    formularioRegistro
}