export default async function handler(req, res) {

    const token =
        process.env.MERCADOPAGO_ACCESS_TOKEN;

    try {

        const resposta =
            await fetch(
                "https://api.mercadopago.com/v1/payments",
                {
                    method: "POST",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({

                        transaction_amount: 4.90,

                        description:
                            "5 Créditos Contrata Reserva",

                        payment_method_id:
                            "pix",

                        payer: {
                            email:
                                "teste@contratareserva.com"
                        }

                    })
                }
            );

        const dados =
            await resposta.json();

        res.status(200).json(dados);

    }
    catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

}