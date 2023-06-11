import express from "express";
import { formularioLogin, formularioRegistro } from "../controllers/usuarioController.js";
const router = express.Router()

router.get('/login', formularioLogin)
router.get('/registro', formularioRegistro)


/* router.route('/')
    .get(function (req, res) {
        res.json({ mensaje: "hola mundo en express" })
    })
    .post(function (req, res) {
        res.json({ msg: "respuesta de tipo post" })
    }) */

export default router