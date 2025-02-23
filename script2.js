// Chave Pix (não visível no HTML)
const pixKey = "550.172.585-30"; // Substitua pela sua chave Pix

// Função para habilitar/desabilitar o botão de envio com base nas checkboxes
const checkboxes = document.querySelectorAll('.form-check-input');
const submitButton = document.getElementById('submitInfo');
const formaPagamento = document.getElementById('formaPagamento');
const pixCard = document.getElementById('pixCard');

const updateButtonState = () => {
    submitButton.disabled = !checkboxes[0].checked || !checkboxes[1].checked;
};

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateButtonState);
});

// Exibir o card do Pix se a opção for selecionada
formaPagamento.addEventListener('change', () => {
    if (formaPagamento.value === "Pix") {
        pixCard.style.display = "block";
    } else {
        pixCard.style.display = "none";
    }
});

// Função para copiar a chave Pix
function copyPixKey() {
    navigator.clipboard.writeText(pixKey).then(() => {
        alert("Chave Pix copiada!");
    });
}

// Função para salvar os locatários no localStorage
const savePendingLocatarios = () => {
    const locatariosPendentes = JSON.parse(localStorage.getItem('locatariosPendentes')) || [];
    const locatario = {
        id: Date.now(),
        codigo: 'LOC' + Date.now() + Math.floor(Math.random() * 1000),
        nome: document.getElementById('nome').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        rg: document.getElementById('rg').value.trim(),
        celular: document.getElementById('celular').value.trim(),
        valor: document.getElementById('valor').value.trim(),
        formaPagamento: document.getElementById('formaPagamento').value,
        status: 'pendente'
    };

    locatariosPendentes.push(locatario); // Adiciona o novo locatário ao array
    localStorage.setItem('locatariosPendentes', JSON.stringify(locatariosPendentes));
    alert("Cadastro enviado com sucesso!");
    window.location.href = 'cadastro.html';
};

submitButton.addEventListener('click', () => {
    savePendingLocatarios();
});
