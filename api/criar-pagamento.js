export default async function handler(req, res) {

    const token =
        process.env.MERCADOPAGO_ACCESS_TOKEN;

    try {

        const resposta =
            await fetch(
                "https://api.mercadopago.com/v1/orders",
                {
                    method: "POST",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        type: "online",
                        external_reference:
                            "contrata_reserva_teste",

                        total_amount: "5.00",

                        payer: {
                            email:
                                "test_user_br@testuser.com",
                            first_name:
                                "APRO"
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