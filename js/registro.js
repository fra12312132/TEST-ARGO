// File: js/registro.js (VERSIONE OTTIMIZZATA)
let classeIdCorrente;
let studentiDellaClasse = [];
const oggiString = new Date().toISOString().split('T')[0];

// --- UTILITY ---
function getData(key, defaultValue = []) {
    try { return JSON.parse(localStorage.getItem(key)) || defaultValue; } 
    catch { return defaultValue; }
}
function setData(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    const docenteLoggato = JSON.parse(sessionStorage.getItem('docenteLoggato'));
    if (!docenteLoggato) return window.location.href = './index.html';

    const params = new URLSearchParams(window.location.search);
    classeIdCorrente = parseInt(params.get('classeId'));

    const classeCorrente = getData('sim_classi').find(c => c.id === classeIdCorrente);
    if (!classeCorrente) { alert("Classe non trovata!"); return window.location.href = './dashboard.html'; }

    document.getElementById('docente-nome').innerText = `Prof. ${docenteLoggato.nome} ${docenteLoggato.cognome}`;
    document.getElementById('nome-classe').innerText = classeCorrente.nome;

    studentiDellaClasse = getData('sim_alunni').filter(a => a.classeId === classeIdCorrente);

    setupFirma(docenteLoggato.id);
    document.getElementById('termina-lezione-btn').addEventListener('click', terminaLezione);
});

// --- FIRMA ---
function setupFirma(docenteId) {
    const orario = getData('sim_orario').filter(l => l.docenteId === docenteId && l.classeId === classeIdCorrente);
    const selectOra = document.getElementById('firma-ora');
    const selectMateria = document.getElementById('firma-materia');
    selectOra.innerHTML = '';
    selectMateria.innerHTML = '';

    const ore = orario.length ? [...new Set(orario.map(l => l.ora))].sort((a,b)=>a-b) : [1,2,3,4,5,6,7,8];
    ore.forEach(ora => selectOra.innerHTML += `<option value="${ora}">${ora}ª ora</option>`);

    const tuttiDocenti = getData('sim_docenti_sistema', docenti).concat(getData('sim_docenti_locali'));
    const docente = tuttiDocenti.find(d => d.id === docenteId);
    if (docente?.materie) docente.materie.forEach(mId => {
        const materia = materie.find(m => m.id === mId);
        if (materia) selectMateria.innerHTML += `<option value="${materia.id}">${materia.nome}</option>`;
    });

    document.getElementById('avvia-lezione-btn').addEventListener('click', () => {
        document.getElementById('schermata-firma').style.display = 'none';
        document.getElementById('contenitore-registro').style.display = 'block';
        document.getElementById('termina-lezione-btn').style.display = 'inline-block';
        setupRegistro();
    });
}

// --- REGISTRO ---
function setupRegistro() {
    setupTabs();
    setupAppello();
    setupVoti();
    setupArgomenti();
    setupCompiti();
    setupNote();
}

function terminaLezione() {
    if (!confirm("Terminare e salvare la lezione?")) return;

    const lezioniSalvate = getData('sim_lezioni_salvate');
    lezioniSalvate.push({
        id: Date.now(),
        classeId: classeIdCorrente,
        data: oggiString,
        presenze: getData('sim_presenze').filter(p => p.data === oggiString && studentiDellaClasse.find(s => s.id === p.studenteId)),
        argomenti: getData('sim_argomenti').filter(a => a.data === oggiString && a.classeId === classeIdCorrente),
        compiti: getData('sim_compiti').filter(c => c.data === oggiString && c.classeId === classeIdCorrente),
        note: getData('sim_note').filter(n => n.data === oggiString && n.classeId === classeIdCorrente)
    });
    setData('sim_lezioni_salvate', lezioniSalvate);
    alert("Lezione archiviata!");
    window.location.reload();
}

// --- TABS ---
function setupTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`tab-content-${button.dataset.tab}`).classList.add('active');
        });
    });
    document.querySelector('.tab-button[data-tab="appello"]').click();
}

// --- APPELLO ---
function setupAppello() { caricaAppello(); }

function caricaAppello() {
    const table = document.getElementById('tabella-appello');
    table.innerHTML = '<thead><tr><th>Alunno</th><th>Stato</th><th>Note</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector('tbody');
    const presenze = getData('sim_presenze');

    studentiDellaClasse.forEach(studente => {
        const row = document.createElement('tr');
        const statoOggi = presenze.find(p => p.studenteId === studente.id && p.data === oggiString);

        const statoHtml = `
            <div class="stato-appello-group">
                <button class="btn btn-sm stato-P ${statoOggi?.stato==='P'?'active btn-success':''}" data-studente-id="${studente.id}" data-stato="P">P</button>
                <button class="btn btn-sm stato-A ${statoOggi?.stato==='A'?'active btn-danger':''}" data-studente-id="${studente.id}" data-stato="A">A</button>
                <button class="btn btn-sm stato-R ${statoOggi?.stato==='R'?'active btn-warning':''}" data-studente-id="${studente.id}" data-stato="R">R</button>
            </div>`;

        let noteHtml = '';
        if (statoOggi?.stato === 'R') noteHtml = `Ritardo di ${statoOggi.minuti} min. (${statoOggi.giustificazione})`;
        if (statoOggi?.stato === 'A' && statoOggi.giustificata) noteHtml = `<span class="status-giustificata">Assenza Giustificata</span>`;

        // Controllo assenze non giustificate ieri
        const ieri = new Date();
        ieri.setDate(ieri.getDate() - 1);
        const ieriString = ieri.toISOString().split('T')[0];
        const assenzaIeri = presenze.find(p => p.studenteId === studente.id && p.data === ieriString && p.stato==='A' && !p.giustificata);
        if (assenzaIeri) noteHtml += ` <button class="btn btn-secondary btn-sm giustifica-btn" data-presenza-id="${assenzaIeri.id}">Giustifica</button>`;

        row.innerHTML = `<td>${studente.cognome} ${studente.nome}</td><td>${statoHtml}</td><td>${noteHtml}</td>`;
        tbody.appendChild(row);
    });

    table.querySelectorAll('.stato-appello-group button').forEach(b => b.addEventListener('click', gestisciStatoAppello));
    table.querySelectorAll('.giustifica-btn').forEach(b => b.addEventListener('click', giustificaAssenza));
}

function gestisciStatoAppello(e) {
    const button = e.target;
    const { studenteId, stato } = button.dataset;
    if (stato === 'R') return apriModal('modal-ritardo', { studenteId: parseInt(studenteId) });
    salvaPresenza(parseInt(studenteId), stato);
}

function salvaPresenza(studenteId, stato, dettagli = {}) {
    let presenze = getData('sim_presenze');
    const idx = presenze.findIndex(p => p.studenteId===studenteId && p.data===oggiString);
    const newRecord = { id: idx>-1?presenze[idx].id:Date.now(), studenteId, data: oggiString, stato, giustificata: stato==='A'?false:null, ...dettagli };
    if (idx>-1) presenze[idx] = newRecord; else presenze.push(newRecord);
    setData('sim_presenze', presenze);
    caricaAppello();
}

function giustificaAssenza(e) {
    const presenzaId = parseInt(e.target.dataset.presenzaId);
    let presenze = getData('sim_presenze');
    const idx = presenze.findIndex(p => p.id === presenzaId);
    if (idx > -1) { presenze[idx].giustificata = true; setData('sim_presenze', presenze); caricaAppello(); }
}

// --- RESTO DELLE FUNZIONALITÀ ---
// setupVoti(), setupArgomenti(), setupCompiti(), setupNote() e apriModal() rimangono identiche
// Basta incollare il codice attuale per voti/compiti/note/modal, solo ripulito con lo stesso pattern
