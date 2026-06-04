export default async function handler(req, res) {

    res.status(200).json({
        mensagem: "API funcionando",
        tokenExiste: !!process.env.MERCADOPAGO_ACCESS_TOKEN
    });

}