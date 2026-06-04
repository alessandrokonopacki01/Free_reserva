const resposta =
    await fetch(
        "https://api.mercadopago.com/v1/orders",
        {
            method: "POST",
            headers: {
                "Authorization":
                    `Bearer ${token}`,
                "Content-Type":
                    "application/json",
                "X-Idempotency-Key":
                    crypto.randomUUID()
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