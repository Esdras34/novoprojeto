// Recuperar dados do localStorage
let locatariosPendentes = JSON.parse(localStorage.getItem('locatariosPendentes')) || [];
let locatariosAprovados = JSON.parse(localStorage.getItem('locatariosAprovados')) || [];

const pendingCardsContainer = document.getElementById('pendingCardsContainer');
const approvedCardsContainer = document.getElementById('approvedCardsContainer');

// Função para criar um card com todos os dados do locatário
const createCard = (locatario, isApproved = false) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('col-md-4');

    // Criar o conteúdo do card dinamicamente
    let cardContent = '<div class="card p-3" data-id="'+ locatario.id + '">';
    cardContent += `<i class="bi bi-x delete-icon" data-id="${locatario.id}"></i>`; // Ícone "x" para excluir
    cardContent += `<i class="bi bi-printer print-icon" data-id="${locatario.id}"></i>`; // Ícone de impressão
    for (const [key, value] of Object.entries(locatario)) {
        // Ignorar campos internos que não devem ser exibidos
        if (key !== 'id' && key !== 'status' && key !== 'startTime' && key !== 'elapsedTime' && key !== 'isRunning' && key !== 'observation') {
            cardContent += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    }

    if (isApproved) {
        // Adicionar cronômetro e controles
        cardContent += ` 
            <div class="timer">Tempo: <span id="timer-${locatario.id}">${formatTime(locatario.elapsedTime || 0)}</span></div>
            <div class="timer-controls">
                <button class="btn btn-success" onclick="startTimer(${locatario.id})">Iniciar</button>
                <button class="btn btn-warning" onclick="pauseTimer(${locatario.id})">Pausar</button>
                <button class="btn btn-danger" onclick="resetTimer(${locatario.id})">Resetar</button>
            </div>`;
    } else {
        // Adicionar botões de aprovação e recusa
        cardContent += `
            <button class="accept-btn" data-id="${locatario.id}">Aprovar</button>
            <button class="delete-btn" data-id="${locatario.id}">Recusar</button>`;
    }

    // Adicionar a seção de observação SOMENTE nos cards pendentes
    if (!isApproved) {
        cardContent += `
            <div class="observation-container">
                <textarea class="observation-input" id="observation-${locatario.id}" placeholder="Adicionar observação...">${locatario.observation || ''}</textarea>
                <button class="save-observation-btn" data-id="${locatario.id}" onclick="saveObservation(${locatario.id})">Salvar Observação</button>
            </div>
        `;
    } else {
        // Mostrar a observação diretamente no card
        cardContent += `
            <p><strong>Observação:</strong> ${locatario.observation || 'Nenhuma observação'}</p>
        `;
    }

    cardContent += '</div>';
    cardDiv.innerHTML = cardContent;

    if (isApproved) {
        approvedCardsContainer.appendChild(cardDiv);
    } else {
        pendingCardsContainer.appendChild(cardDiv);
    }
};

// Função para formatar o tempo (HH:MM:SS)
const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Funções para controlar o cronômetro
const startTimer = (id) => {
    const locatario = locatariosAprovados.find(loc => loc.id === id);
    if (!locatario.isRunning) {
        locatario.isRunning = true;
        locatario.startTime = Date.now() - locatario.elapsedTime;
        updateTimerDisplay(id);
        localStorage.setItem('locatariosAprovados', JSON.stringify(locatariosAprovados));
    }
};

const pauseTimer = (id) => {
    const locatario = locatariosAprovados.find(loc => loc.id === id);
    if (locatario.isRunning) {
        locatario.isRunning = false;
        locatario.elapsedTime = Date.now() - locatario.startTime;
        localStorage.setItem('locatariosAprovados', JSON.stringify(locatariosAprovados));
    }
};

const resetTimer = (id) => {
    const locatario = locatariosAprovados.find(loc => loc.id === id);
    locatario.isRunning = false;
    locatario.elapsedTime = 0;
    localStorage.setItem('locatariosAprovados', JSON.stringify(locatariosAprovados));
    updateTimerDisplay(id);
};

// Atualizar os cronômetros a cada segundo
setInterval(() => {
    locatariosAprovados.forEach(loc => {
        if (loc.isRunning) {
            loc.elapsedTime = Date.now() - loc.startTime;
            const timerElement = document.getElementById(`timer-${loc.id}`);
            if (timerElement) {
                timerElement.textContent = formatTime(loc.elapsedTime);
            }
        }
    });
}, 1000);

// Função para salvar a observação apenas em cards pendentes
const saveObservation = (id) => {
    const observationInput = document.getElementById(`observation-${id}`);
    const locatario = locatariosPendentes.find(loc => loc.id === id);
    if (locatario) {
        locatario.observation = observationInput.value;
        localStorage.setItem('locatariosPendentes', JSON.stringify(locatariosPendentes));

        // Atualizar a interface para refletir a nova observação
        const card = document.querySelector(`.card[data-id="${id}"]`);
        const observationDisplay = card.querySelector('.observation-container');
        observationDisplay.innerHTML = `<p><strong>Observação:</strong> ${locatario.observation}</p>`;
    }
};

// Função para excluir um locatário
const deleteCard = (id) => {
    locatariosPendentes = locatariosPendentes.filter(loc => loc.id !== id);
    locatariosAprovados = locatariosAprovados.filter(loc => loc.id !== id);

    // Atualizar o localStorage
    localStorage.setItem('locatariosPendentes', JSON.stringify(locatariosPendentes));
    localStorage.setItem('locatariosAprovados', JSON.stringify(locatariosAprovados));

    // Recarregar as listas
    loadCards();
};

// Função para imprimir os dados de um card
const printCard = (id) => {
    const locatario = locatariosPendentes.find(loc => loc.id === id) || locatariosAprovados.find(loc => loc.id === id);
    const printContent = Object.entries(locatario)
        .filter(([key]) => key !== 'id' && key !== 'status' && key !== 'startTime' && key !== 'elapsedTime' && key !== 'isRunning' && key !== 'observation')
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join('');

    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Imprimir Locatário</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; }
                    p { margin: 10px 0; }
                </style>
            </head>
            <body>
                <h1>Dados do Locatário</h1>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    };
                <\/script>
            </body>
        </html>
    `);
    printWindow.document.close();
};

// Função para aprovar um locatário
const approveCard = (id) => {
    const locatario = locatariosPendentes.find(loc => loc.id === id);
    locatariosAprovados.push({ ...locatario, startTime: Date.now(), elapsedTime: 0, isRunning: false });
    locatariosPendentes = locatariosPendentes.filter(loc => loc.id !== id);

    // Atualizar o localStorage
    localStorage.setItem('locatariosPendentes', JSON.stringify(locatariosPendentes));
    localStorage.setItem('locatariosAprovados', JSON.stringify(locatariosAprovados));

    // Recarregar as listas
    loadCards();
};

// Função para recusar um locatário
const rejectCard = (id) => {
    locatariosPendentes = locatariosPendentes.filter(loc => loc.id !== id);
    localStorage.setItem('locatariosPendentes', JSON.stringify(locatariosPendentes));
    loadCards();
};

// Função para carregar os cards
const loadCards = () => {
    pendingCardsContainer.innerHTML = '';
    approvedCardsContainer.innerHTML = '';
    locatariosPendentes.forEach(loc => createCard(loc));
    locatariosAprovados.forEach(loc => createCard(loc, true));
};

// Adicionar eventos de clique aos ícones e botões
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-icon')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        deleteCard(id);
    }
    if (event.target.classList.contains('print-icon')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        printCard(id);
    }
    if (event.target.classList.contains('accept-btn')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        approveCard(id);
    }
    if (event.target.classList.contains('delete-btn')) {
        const id = parseInt(event.target.getAttribute('data-id'));
        rejectCard(id);
    }
});

// Carregar os cards ao iniciar a página
loadCards();
