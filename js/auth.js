// File: js/auth.js (VERSIONE MIGLIORATA)
// Legge SEMPRE i dati da localStorage e gestisce login admin/docente

const ADMIN_USER = "Presidenza";
const ADMIN_PASS = "admin123";

document.addEventListener('DOMContentLoaded', () => {
    // Inizializza docenti di sistema se non presenti nel localStorage
    function inizializzaDocenti() {
        if (!localStorage.getItem('sim_docenti_inizializzati')) {
            localStorage.setItem('sim_docenti_all', JSON.stringify(docenti));
            localStorage.setItem('sim_docenti_inizializzati', 'true');
        }
    }

    inizializzaDocenti();

    // Se già loggati, reindirizza alla pagina corretta
    if (sessionStorage.getItem('adminLoggato')) {
        window.location.href = './admin.html';
        return;
    }
    if (sessionStorage.getItem('docenteLoggato')) {
        window.location.href = './dashboard.html';
        return;
    }

    // Evento per login
    document.getElementById('login-button').addEventListener('click', handleLogin);
});

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';
    errorMessage.innerText = '';

    if (!username || !password) {
        errorMessage.innerText = "Inserire username e password.";
        errorMessage.style.display = 'block';
        return;
    }

    // Login Admin
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem('adminLoggato', 'true');
        window.location.href = './admin.html';
        return;
    }

    // Login Docente: legge sempre dal localStorage
    const tuttiIDocenti = JSON.parse(localStorage.getItem('sim_docenti_all')) || [];
    const docenteTrovato = tuttiIDocenti.find(d => d.email === username && d.password === password);

    if (!docenteTrovato) {
        errorMessage.innerText = "Credenziali non corrette.";
        errorMessage.style.display = 'block';
        return;
    }

    if (docenteTrovato.status !== 'active') {
        const motivazione = docenteTrovato.motivation ? `\nMotivazione: ${docenteTrovato.motivation}` : '';
        errorMessage.innerText = `Accesso negato. L'account è sospeso.${motivazione}`;
        errorMessage.style.display = 'block';
        return;
    }

    // Login Docente riuscito
    sessionStorage.setItem('docenteLoggato', JSON.stringify(docenteTrovato));
    window.location.href = './dashboard.html';
}
