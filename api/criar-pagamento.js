export default async function handler(req, res) {

    const token =
        process.env.MERCADOPAGO_ACCESS_TOKEN;

    res.status(200).json({
        inicioToken: token.substring(0, 15)
    });

}