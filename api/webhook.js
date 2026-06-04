import { db } from "../firebase-admin.js";

export default async function handler(req, res) {

    try {

        await db
            .collection("logs_webhook")
            .add({
                recebidoEm: new Date(),
                dados: req.body
            });

        return res.status(200).json({
            recebido: true
        });

    } catch (erro) {

        return res.status(500).json({
            erro: erro.message
        });

    }

}