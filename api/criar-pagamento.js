export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            erro: "Método não permitido"
        });
    }
    const token =
        process.env.MERCADOPAGO_ACCESS_TOKEN;

    const { uid } = req.body;
    if (!uid) {
        return res.status(400).json({
            erro: "UID não informado"
        });
    }
    try {

        const resposta =
            await fetch(
                "https://api.mercadopago.com/v1/orders",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "X-Idempotency-Key": crypto.randomUUID()
                    },
                    body: JSON.stringify({
                        type: "online",
                        external_reference:
                            uid,

                        total_amount: "5.00",

                        payer: {
                            payer: {
                                email: email,
                                first_name: nome || "Cliente"
                            },

                            transactions: {
                                payments: [
                                    {
                                        amount: "5.00",
                                        payment_method: {
                                            id: "pix",
                                            type: "bank_transfer"
                                        }
                                    }
                                ]
                            }
                        })
                }
            );

        const dados =
            await resposta.json();

        res.status(200).json(dados);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

}