import { db } from "../firebase-admin.js";

export default async function handler(req, res) {

    try {

        const dados = req.body;

        if (
            dados.action !== "order.processed"
        ) {
            return res.status(200).json({
                ignorado: true
            });
        }

        const uid =
            dados.data.external_reference;

        const paymentId =
            dados.data.transactions
                .payments[0].id;

        const pagamentoRef =
            db.collection(
                "pagamentos_processados"
            ).doc(paymentId);

        const pagamentoDoc =
            await pagamentoRef.get();

        if (pagamentoDoc.exists) {

            return res.status(200).json({
                duplicado: true
            });

        }

        const usuarioRef =
            db.collection("usuarios")
              .doc(uid);

        const usuarioDoc =
            await usuarioRef.get();

        if (!usuarioDoc.exists) {

            return res.status(404).json({
                erro: "Usuário não encontrado"
            });

        }

        const creditosAtuais =
            usuarioDoc.data().creditos || 0;

        await usuarioRef.update({
            creditos:
                creditosAtuais + 5
        });

        await pagamentoRef.set({

            processado: true,

            uid,

            creditosAdicionados: 5,

            dataProcessamento:
                new Date()

        });

        return res.status(200).json({
            sucesso: true
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            erro: erro.message
        });

    }

}