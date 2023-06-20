import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos


    //Enviar el email
    await transport.sendMail({
        from: 'negociosinmobiliarios.com',
        to: email,
        subject: 'Confirma tu cuenta en negociosinmobiliarios.com',
        text: 'Confirma tu cuenta en negociosinmobiliarios.com',
        html: `
            <p>Hola ${nombre}, por favor verifica que eres tú el propietario</p>

            <p>Tu cuenta ya esta lista, solo debes configurarla en el siguiente enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a> </p>

            <p>Si tu no creaste esta cuenta desestima este mensaje</p>
        `
    })
}

const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos


    //Enviar el email
    await transport.sendMail({
        from: 'negociosinmobiliarios.com',
        to: email,
        subject: 'Restablece tu Password en negociosinmobiliarios.com',
        text: 'Confirma tu cuenta en negociosinmobiliarios.com',
        html: `
            <p>Hola ${nombre}, has solicitado reestablecer tu password en negociosinmobiliarios.com</p>

            <p>Sigue el siguiente enlace para generar un password nuevo: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/restaurar-password/${token}">Reestablecer Password</a> </p>

            <p>Si tu no solicitaste el cambio de password puedes desestimar este mensaje.</p>
        `
    })
}






export {
    emailRegistro,
    emailOlvidePassword
}