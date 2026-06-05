import { auth } from "./firebase.js";
document
    .getElementById("btnComprar")
    .addEventListener("click", async () => {
        const usuario = auth.currentUser;
        if (!usuario) {
            alert("Faça login primeiro");
            return;
        }
        const resposta =
            await fetch(
                "/api/criar-pagamento",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        uid: usuario.uid,
                        email: usuario.email,
                        nome: usuario.displayName
                    })
                }
            );
        const texto = await resposta.text();
        console.log("Resposta bruta da API:", texto);
        const dados = JSON.parse(texto);
        console.log(dados);
        if (!dados.transactions || !dados.transactions.payments) {
            console.error("Erro ao gerar Pix:", JSON.stringify(dados, null, 2));
            document.getElementById("resultado").innerHTML = `
        <p style="color:red;">
            Erro ao gerar Pix. Veja o console.
        </p>
        <pre>${JSON.stringify(dados, null, 2)}</pre>
    `;
            return;
        }
        const pagamento =
            dados.transactions.payments[0];
        document
            .getElementById("resultado")
            .innerHTML = `
<h3>Pix Gerado</h3>
<p>
Copie e cole:
</p>
<textarea
rows="6"
cols="50">
${pagamento.payment_method.qr_code}
</textarea>
<br><br>
<a href="${pagamento.payment_method.ticket_url}"
target="_blank">
Abrir QR Code
</a>
`;
    });