document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const emailValido = "maranata@v"; // Exemplo de email
    const senhaValida = "maranata123"; // Exemplo de senha

    if (email === emailValido && senha === senhaValida) {
        window.location.href = "cardsp.html"; // Página de sucesso após login
    } else {
        document.getElementById("errorMessage").textContent = "E-mail ou senha incorretos. Tente novamente.";
    }
});
