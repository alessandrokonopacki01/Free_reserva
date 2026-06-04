import { db } from "../firebase-admin.js";

export default async function handler(req, res) {

    try {

        console.log("WEBHOOK RECEBIDO");

        console.log(req.body);

        return res.status(200).json({
            recebido: true
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            erro: erro.message
        });

    }

}