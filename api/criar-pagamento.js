export default async function handler(req, res) {

    const token =
        process.env.MERCADOPAGO_ACCESS_TOKEN;

    res.status(200).json({
        funcionando: true,
        tamanhoToken: token.length
    });

}