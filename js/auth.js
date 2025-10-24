// File: js/auth.js
const ADMIN_USER = "Presidenza";
const ADMIN_PASS = "admin123";

document.addEventListener('DOMContentLoaded', () => {
    // Inizializza docenti di sistema
    if (!localStorage.getItem('sim_docenti_inizializzati')) {
        localStorage.setItem('sim_docenti_all', JSON.stringify(docenti));
        localStorage.setItem('sim_docenti_inizializzati', 'true');
    }

    if (sessionStorage.getItem('adminLoggato')) { window.location.href = './admin.html'; return; }
    if (sessionStorage.getItem('docenteLoggato')) { window.location.href = './dashboard.html'; return; }

    document.getElementById('login-button').addEventListener('click', handleLogin);
});

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';

    // LOGIN ADMIN
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem('adminLoggato', 'true');
        window.location.href = './admin.html';
        return;
    }

    // LOGIN DOCENTI
    const tuttiIDocenti = JSON.parse(localStorage.getItem('sim_docenti_all')) || [];
    const docenteTrovato = tuttiIDocenti.find(d => d.email === username && d.password === password);

    if (docenteTrovato) {
        if (docenteTrovato.status === 'active') {
            sessionStorage.setItem('docenteLoggato', JSON.stringify(docenteTrovato));
            window.location.href = './dashboard.html';
        } else {
            const motivazione = docenteTrovato.motivation ? `\nMotivazione: ${docenteTrovato.motivation}` : '';
            errorMessage.innerText = `Accesso negato. L'account è sospeso.${motivazione}`;
            errorMessage.style.display = 'block';
        }
    } else {
        errorMessage.innerText = "Credenziali non corrette.";
        errorMessage.style.display = 'block';
    }
}
