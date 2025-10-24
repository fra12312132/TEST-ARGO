// File: js/dashboard.js (VERSIONE FINALE - VERIFICATA)
document.addEventListener('DOMContentLoaded', () => {
    const docenteLoggato = JSON.parse(sessionStorage.getItem('docenteLoggato'));
    if (!docenteLoggato) { window.location.href = './index.html'; return; }
    document.getElementById('docente-nome').innerText = `Prof. ${docenteLoggato.nome} ${docenteLoggato.cognome}`;
    document.getElementById('logout-button').addEventListener('click', () => { sessionStorage.removeItem('docenteLoggato'); window.location.href = './index.html'; });
    caricaTutteLeClassi();
});
function caricaTutteLeClassi() {
    const container = document.getElementById('classi-container');
    const classiCorrenti = JSON.parse(localStorage.getItem('sim_classi')) || [];
    container.innerHTML = '';
    if (classiCorrenti.length === 0) {
        container.innerHTML = "<p>Nessuna classe è stata ancora creata dalla Presidenza.</p>";
        return;
    }
    classiCorrenti.forEach(classe => {
        const schedaClasse = document.createElement('div');
        schedaClasse.className = 'content-box';
        schedaClasse.style.cursor = 'pointer';
        schedaClasse.innerHTML = `<h3>${classe.nome}</h3><p>Apri Registro di Classe</p>`;
        schedaClasse.onclick = () => { window.location.href = `./registro.html?classeId=${classe.id}`; };
        container.appendChild(schedaClasse);
    });
}