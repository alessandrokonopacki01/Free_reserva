export default async function handler(req, res) {

    console.log("WEBHOOK RECEBIDO");

    console.log(
        JSON.stringify(req.body, null, 2)
    );

    return res.status(200).json({
        recebido: true
    });

}