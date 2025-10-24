// File: js/admin.js (VERSIONE FINALE - CON FIX PRESIDENZA)
const NOMI_CASUALI = ["Mario", "Giuseppe", "Alessandro", "Luca", "Davide", "Simone", "Andrea", "Marco", "Francesco", "Matteo", "Giulia", "Sofia", "Aurora", "Alice", "Ginevra", "Emma", "Giorgia", "Greta", "Vittoria", "Beatrice", "Chiara", "Sara", "Elena", "Martina", "Francesca"];
const COGNOMI_CASUALI = ["Rossi", "Ferrari", "Russo", "Bianchi", "Romano", "Gallo", "Costa", "Fontana", "Conti", "Esposito", "Ricci", "Bruno", "De Luca", "Moretti", "Marino", "Greco", "Barbieri", "Lombardi", "Giordano", "Colombo"];
function getData(key, defaultValue = []) { try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : defaultValue; } catch (e) { return defaultValue; } }
function setData(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

document.addEventListener('DOMContentLoaded', () => {
    function inizializzaDocenti() { if (!localStorage.getItem('sim_docenti_inizializzati_v2')) { localStorage.setItem('sim_docenti_all', JSON.stringify(docenti)); localStorage.setItem('sim_docenti_inizializzati_v2', 'true'); } }
    inizializzaDocenti();
    if (!sessionStorage.getItem('adminLoggato')) { window.location.href = './index.html'; return; }
    document.getElementById('logout-button').addEventListener('click', () => { sessionStorage.removeItem('adminLoggato'); window.location.href = './index.html'; });
    setupSezioneDocenti();
    setupSezioneClassi();
    setupModal();
});

function setupSezioneDocenti() {
    const materieContainer = document.getElementById('materie-checkboxes');
    materieContainer.innerHTML = '';
    materie.forEach(materia => { materieContainer.innerHTML += `<label><input type="checkbox" name="materia" value="${materia.id}"> ${materia.nome}</label><br>`; });
    document.getElementById('add-docente-button').addEventListener('click', aggiungiDocente);
    mostraDocenti();
}
function setupSezioneClassi() { document.getElementById('crea-classe-button').addEventListener('click', creaClasse); mostraClassi(); }
function setupModal() {
    document.querySelectorAll('.close-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    document.getElementById('salva-modifiche-docente-btn').addEventListener('click', salvaModificheDocente);
}

function mostraDocenti() {
    const listaContainer = document.getElementById('lista-docenti');
    const tuttiIDocenti = getData('sim_docenti_all', docenti); // Usa i docenti di default se non ci sono dati salvati
    if (tuttiIDocenti.length === 0) { listaContainer.innerHTML = '<p>Nessun docente registrato.</p>'; return; }
    const table = document.createElement('table');
    table.className = 'styled-table';
    table.innerHTML = `<thead><tr><th>Nome</th><th>Email</th><th>Stato</th><th>Azioni</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    tuttiIDocenti.forEach(docente => {
        const row = document.createElement('tr');
        const isDefault = docente.id.startsWith("doc_sys_");
        let statoText = docente.status === 'active' ? `<span style="color: var(--green);">Attivo</span>` : `<span style="color: var(--yellow);">Sospeso</span>`;
        let azioniHtml = `<button class="btn btn-primary btn-sm btn-modifica" data-id="${docente.id}">Modifica</button>`;
        if (docente.status === 'active') { azioniHtml += ` <button class="btn btn-secondary btn-sm btn-sospendi" data-id="${docente.id}">Sospendi</button>`; }
        else { azioniHtml += ` <button class="btn btn-primary btn-sm btn-riattiva" data-id="${docente.id}">Riattiva</button>`; }
        if (!isDefault) { azioniHtml += ` <button class="btn btn-danger btn-sm btn-banna" data-id="${docente.id}">Banna</button>`; }
        azioniHtml += ` <button class="btn btn-primary btn-sm btn-gestisci-classi" data-id="${docente.id}" data-nome="${docente.nome} ${docente.cognome}">Orario</button>`;
        row.innerHTML = `<td>${docente.nome} ${docente.cognome} ${isDefault ? '(Sistema)' : ''}</td><td>${docente.email}</td><td>${statoText}</td><td>${azioniHtml}</td>`;
        tbody.appendChild(row);
    });
    listaContainer.innerHTML = '';
    listaContainer.appendChild(table);
    document.querySelectorAll('.btn-modifica').forEach(b => b.addEventListener('click', e => apriModalModifica(e.target.dataset.id)));
    document.querySelectorAll('.btn-sospendi').forEach(b => b.addEventListener('click', e => modificaStato(e.target.dataset.id, 'suspended')));
    document.querySelectorAll('.btn-riattiva').forEach(b => b.addEventListener('click', e => modificaStato(e.target.dataset.id, 'active')));
    document.querySelectorAll('.btn-banna').forEach(b => b.addEventListener('click', e => bannaDocente(e.target.dataset.id)));
    document.querySelectorAll('.btn-gestisci-classi').forEach(b => b.addEventListener('click', e => gestisciClassiDocente(e.target.dataset.id, e.target.dataset.nome)));
}

function apriModalModifica(docenteId) {
    const tuttiIDocenti = getData('sim_docenti_all');
    const docente = tuttiIDocenti.find(d => d.id === docenteId);
    if (!docente) return;
    document.getElementById('modifica-docente-id').value = docente.id;
    document.getElementById('modifica-nome').value = docente.nome;
    document.getElementById('modifica-cognome').value = docente.cognome;
    document.getElementById('modifica-email').value = docente.email;
    document.getElementById('modifica-password').value = docente.password;
    const materieContainer = document.getElementById('modifica-materie-checkboxes');
    materieContainer.innerHTML = '';
    materie.forEach(materia => { const isChecked = docente.materie.includes(materia.id) ? 'checked' : ''; materieContainer.innerHTML += `<label><input type="checkbox" value="${materia.id}" ${isChecked}> ${materia.nome}</label><br>`; });
    document.getElementById('modal-modifica-docente').style.display = 'flex';
}

function salvaModificheDocente() {
    const docenteId = document.getElementById('modifica-docente-id').value;
    let tuttiIDocenti = getData('sim_docenti_all');
    const docenteIndex = tuttiIDocenti.findIndex(d => d.id === docenteId);
    if (docenteIndex === -1) return;
    const materieSelezionate = Array.from(document.querySelectorAll('#modifica-materie-checkboxes input:checked')).map(c => parseInt(c.value));
    tuttiIDocenti[docenteIndex].nome = document.getElementById('modifica-nome').value;
    tuttiIDocenti[docenteIndex].cognome = document.getElementById('modifica-cognome').value;
    tuttiIDocenti[docenteIndex].email = document.getElementById('modifica-email').value;
    tuttiIDocenti[docenteIndex].password = document.getElementById('modifica-password').value;
    tuttiIDocenti[docenteIndex].materie = materieSelezionate;
    setData('sim_docenti_all', tuttiIDocenti);
    alert('Docente aggiornato!');
    document.getElementById('modal-modifica-docente').style.display = 'none';
    mostraDocenti();
}

function aggiungiDocente() { const nome = document.getElementById('nome').value, cognome = document.getElementById('cognome').value, email = document.getElementById('email').value, password = document.getElementById('password').value; if (!nome || !cognome || !email || !password) { alert("Compilare tutti i campi."); return; } const materieSelezionate = Array.from(document.querySelectorAll('input[name="materia"]:checked')).map(c => parseInt(c.value)); const nuovoDocente = { id: "doc_locale_" + Date.now(), nome, cognome, email, password, materie: materieSelezionate, status: 'active', motivation: null }; let tuttiIDocenti = getData('sim_docenti_all'); tuttiIDocenti.push(nuovoDocente); setData('sim_docenti_all', tuttiIDocenti); alert(`Account (solo locale) per ${nome} ${cognome} creato.`); mostraDocenti(); }

function modificaStato(docenteId, nuovoStato) {
    let motivazione = null;
    if (nuovoStato === 'suspended') {
        motivazione = prompt("Inserisci una motivazione per la sospensione (visibile al docente):");
        if (motivazione === null) return;
    }
    let tuttiIDocenti = getData('sim_docenti_all');
    const docenteIndex = tuttiIDocenti.findIndex(d => d.id === docenteId);
    if (docenteIndex > -1) {
        tuttiIDocenti[docenteIndex].status = nuovoStato;
        tuttiIDocenti[docenteIndex].motivation = motivazione;
        setData('sim_docenti_all', tuttiIDocenti);
    }
    mostraDocenti();
}

function bannaDocente(docenteId) { if (docenteId.startsWith("doc_sys_")) return; if (!confirm("ATTENZIONE: Il ban è definitivo. Procedere?")) return; let tuttiIDocenti = getData('sim_docenti_all'); setData('sim_docenti_all', tuttiIDocenti.filter(d => d.id !== docenteId)); alert("Docente locale bannato."); mostraDocenti(); }
function mostraClassi() { const listaContainer = document.getElementById('lista-classi'); const classiCorrenti = getData('sim_classi'); if (classiCorrenti.length === 0) { listaContainer.innerHTML = '<p>Nessuna classe creata.</p>'; return; } const table = document.createElement('table'); table.className = 'styled-table'; table.innerHTML = `<thead><tr><th>Nome Classe</th><th>Azioni</th></tr></thead><tbody></tbody>`; const tbody = table.querySelector('tbody'); classiCorrenti.forEach(classe => { const row = document.createElement('tr'); row.innerHTML = `<td>${classe.nome}</td><td><button class="btn btn-danger btn-sm btn-elimina-classe" data-id="${classe.id}">Elimina</button></td>`; tbody.appendChild(row); }); listaContainer.innerHTML = ''; listaContainer.appendChild(table); document.querySelectorAll('.btn-elimina-classe').forEach(b => b.addEventListener('click', e => eliminaClasse(parseInt(e.target.dataset.id)))); }
function creaClasse() { const nomeInput = document.getElementById('nuova-classe-nome'); const nomeClasse = nomeInput.value.trim(); if (!nomeClasse) { alert("Inserire un nome per la classe."); return; } let classiCorrenti = getData('sim_classi'); const nuovaClasse = { id: Date.now(), nome: nomeClasse }; classiCorrenti.push(nuovaClasse); setData('sim_classi', classiCorrenti); const nuoviStudenti = generaStudentiPerClasse(nuovaClasse.id, 30); let studentiCorrenti = getData('sim_alunni'); studentiCorrenti = studentiCorrenti.concat(nuoviStudenti); setData('sim_alunni', studentiCorrenti); alert(`Classe "${nomeClasse}" con 30 studenti creata.`); nomeInput.value = ''; mostraClassi(); }
function generaStudentiPerClasse(classeId, numeroStudenti) { const studentiGenerati = []; for (let i = 0; i < numeroStudenti; i++) { const nomeCasuale = NOMI_CASUALI[Math.floor(Math.random() * NOMI_CASUALI.length)]; const cognomeCasuale = COGNOMI_CASUALI[Math.floor(Math.random() * COGNOMI_CASUALI.length)]; studentiGenerati.push({ id: Date.now() + i, nome: nomeCasuale, cognome: cognomeCasuale, classeId: classeId }); } return studentiGenerati; }
function eliminaClasse(classeId) { if (!confirm("Eliminare questa classe e i suoi studenti?")) return; setData('sim_classi', getData('sim_classi').filter(c => c.id !== classeId)); setData('sim_alunni', getData('sim_alunni').filter(s => s.classeId !== classeId)); setData('sim_orario', getData('sim_orario').filter(l => l.classeId !== classeId)); alert("Classe, studenti e orario associato eliminati."); mostraClassi(); }
function gestisciClassiDocente(docenteId, nomeDocente) { const modal = document.getElementById('modal-gestione-classi'); document.getElementById('modal-title').innerText = `Gestisci Orario per: ${nomeDocente}`; const selectClasse = document.getElementById('modal-select-classe'); selectClasse.innerHTML = ''; getData('sim_classi').forEach(c => selectClasse.innerHTML += `<option value="${c.id}">${c.nome}</option>`); mostraOrarioDocente(docenteId); const addButton = document.getElementById('modal-aggiungi-lezione-btn'); const newAddButton = addButton.cloneNode(true); addButton.parentNode.replaceChild(newAddButton, addButton); newAddButton.addEventListener('click', () => aggiungiLezione(docenteId)); modal.style.display = 'flex'; }
function mostraOrarioDocente(docenteId) { const orarioContainer = document.getElementById('orario-docente-lista'); const lezioniDocente = getData('sim_orario').filter(l => l.docenteId === docenteId); if (lezioniDocente.length === 0) { orarioContainer.innerHTML = '<p>Nessuna lezione assegnata.</p>'; return; } const giorni = ["", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]; const classiCorrenti = getData('sim_classi'); const table = document.createElement('table'); table.className = 'styled-table'; table.innerHTML = '<thead><tr><th>Giorno</th><th>Ora</th><th>Classe</th><th>Azione</th></tr></thead><tbody></tbody>'; const tbody = table.querySelector('tbody'); lezioniDocente.forEach(lezione => { const classe = classiCorrenti.find(c => c.id === lezione.classeId); const row = document.createElement('tr'); row.innerHTML = `<td>${giorni[lezione.giorno]}</td><td>${lezione.ora}ª</td><td><b>${classe ? classe.nome : 'N/D'}</b></td><td><button class="btn btn-danger btn-sm" data-lezione-id="${lezione.giorno}-${lezione.ora}-${lezione.classeId}">Rimuovi</button></td>`; tbody.appendChild(row); }); orarioContainer.innerHTML = ''; orarioContainer.appendChild(table); document.querySelectorAll('#orario-docente-lista button').forEach(b => b.addEventListener('click', e => rimuoviLezione(docenteId, e.target.dataset.lezioneId))); }
function aggiungiLezione(docenteId) { const classeId = parseInt(document.getElementById('modal-select-classe').value); const giorno = parseInt(document.getElementById('modal-select-giorno').value); const ora = parseInt(document.getElementById('modal-input-ora').value); if (!ora || ora < 1) { alert("Inserire un'ora valida."); return; } const tuttiIDocenti = getData('sim_docenti_all'); const docente = tuttiIDocenti.find(d => d.id === docenteId); if (!docente || docente.materie.length === 0) { alert("Docente non trovato o senza materie."); return; } const materiaId = docente.materie[0]; const nuovaLezione = { giorno, ora, classeId, materiaId, docenteId }; let orarioCorrente = getData('sim_orario'); orarioCorrente.push(nuovaLezione); setData('sim_orario', orarioCorrente); mostraOrarioDocente(docenteId); }
function rimuoviLezione(docenteId, lezioneId) { const [giorno, ora, classeId] = lezioneId.split('-').map(Number); let orarioCorrente = getData('sim_orario'); setData('sim_orario', orarioCorrente.filter(l => !(l.docenteId === docenteId && l.giorno === giorno && l.ora === ora && l.classeId === classeId))); mostraOrarioDocente(docenteId); }