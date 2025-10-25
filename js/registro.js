// File: js/registro.js (VERSIONE FINALE - CON APPELLO CORRETTO)
let classeIdCorrente; let studentiDellaClasse = []; const oggiString = new Date().toISOString().split('T')[0];
function getData(key, defaultValue = []) { try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : defaultValue; } catch (e) { return defaultValue; } }
function setData(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
document.addEventListener('DOMContentLoaded', () => {
    const docenteLoggato = JSON.parse(sessionStorage.getItem('docenteLoggato'));
    if (!docenteLoggato) { window.location.href = './index.html'; return; }
    const params = new URLSearchParams(window.location.search);
    classeIdCorrente = parseInt(params.get('classeId'));
    const classiCorrenti = getData('sim_classi');
    const classeCorrente = classiCorrenti.find(c => c.id === classeIdCorrente);
    if (!classeCorrente) { alert("Classe non trovata!"); window.location.href = './dashboard.html'; return; }
    document.getElementById('docente-nome').innerText = `Prof. ${docenteLoggato.nome} ${docenteLoggato.cognome}`;
    document.getElementById('nome-classe').innerText = classeCorrente.nome;
    const studentiCorrenti = getData('sim_alunni');
    studentiDellaClasse = studentiCorrenti.filter(a => a.classeId === classeIdCorrente);
    setupFirma(docenteLoggato.id);
    document.getElementById('termina-lezione-btn').addEventListener('click', terminaLezione);
});
function setupFirma(docenteId) {
    const orario = getData('sim_orario');
    const lezioniDisponibili = orario.filter(l => l.docenteId === docenteId && l.classeId === classeIdCorrente);
    const selectOra = document.getElementById('firma-ora'), selectMateria = document.getElementById('firma-materia');
    selectOra.innerHTML = ''; selectMateria.innerHTML = '';
    const ore = lezioniDisponibili.length > 0 ? [...new Set(lezioniDisponibili.map(l => l.ora))].sort((a,b)=>a-b) : [1,2,3,4,5,6,7,8];
    ore.forEach(ora => selectOra.innerHTML += `<option value="${ora}">${ora}ª ora</option>`);
    const docentiDiSistema = getData('sim_docenti_sistema', docenti);
    const docentiLocali = getData('sim_docenti_locali');
    const tuttiIDocenti = docentiDiSistema.concat(docentiLocali);
    const docente = tuttiIDocenti.find(d => d.id === docenteId);
    if (docente && docente.materie) {
        docente.materie.forEach(mId => {
            const materia = materie.find(m => m.id === mId);
            if(materia) selectMateria.innerHTML += `<option value="${materia.id}">${materia.nome}</option>`;
        });
    }
    document.getElementById('avvia-lezione-btn').addEventListener('click', () => {
        document.getElementById('schermata-firma').style.display = 'none';
        document.getElementById('contenitore-registro').style.display = 'block';
        document.getElementById('termina-lezione-btn').style.display = 'inline-block';
        setupRegistro();
    });
}
function setupRegistro() { setupTabs(); setupAppello(); setupVoti(); setupArgomenti(); setupCompiti(); setupNote(); }
function terminaLezione() {
    if (!confirm("Terminare e salvare la lezione?")) return;
    const lezioniSalvate = getData('sim_lezioni_salvate');
    lezioniSalvate.push({
        id: Date.now(),
        classeId: classeIdCorrente,
        data: oggiString,
        presenze: getData('sim_presenze', []).filter(p => p.data === oggiString && studentiDellaClasse.find(s => s.id === p.studenteId)),
        argomenti: getData('sim_argomenti', []).filter(a => a.data === oggiString && a.classeId === classeIdCorrente),
        compiti: getData('sim_compiti', []).filter(c => c.data === oggiString && c.classeId === classeIdCorrente),
        note: getData('sim_note', []).filter(n => n.data === oggiString && n.classeId === classeIdCorrente)
    });
    setData('sim_lezioni_salvate', lezioniSalvate);
    alert("Lezione archiviata!");
    window.location.reload();
}
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

// --- QUESTA SEZIONE E' STATA CORRETTA ---
function setupAppello() {
    caricaAppello();
}
function caricaAppello() {
    const table = document.getElementById('tabella-appello');
    table.innerHTML = '<thead><tr><th>Alunno</th><th>Stato</th><th>Note</th></tr></thead><tbody></tbody>';
    const tbody = table.querySelector('tbody');
    const presenze = getData('sim_presenze', []);
    studentiDellaClasse.forEach(studente => {
        const row = document.createElement('tr');
        const statoOggi = presenze.find(p => p.studenteId === studente.id && p.data === oggiString);
        const statoHtml = `
        
            <div class="stato-appello-group">
                <button class="btn btn-sm stato-P ${statoOggi?.stato === 'P' ? 'active' : ''}" data-studente-id="${studente.id}" data-stato="P" style="${statoOggi?.stato === 'P' ? 'background-color: #0d6f24ff;color:white;' : ''}">P</button>
                <button class="btn btn-sm stato-A ${statoOggi?.stato === 'A' ? 'active' : ''}" data-studente-id="${studente.id}" data-stato="A" style="${statoOggi?.stato === 'A' ? 'background-color: #b70f20ff;color:white;' : ''}">A</button>
                <button class="btn btn-sm stato-R ${statoOggi?.stato === 'R' ? 'active' : ''}" data-studente-id="${studente.id}" data-stato="R" style="${statoOggi?.stato === 'R' ? 'background-color: #f8be4bff;color:black;' : ''}">R</button>
            </div>`;
        let noteHtml = '';
        if (statoOggi?.stato === 'R') noteHtml = `Ritardo di ${statoOggi.minuti} min. (${statoOggi.giustificazione})`;
        if (statoOggi?.stato === 'A' && statoOggi.giustificata) noteHtml = `<span class="status-giustificata">Assenza Giustificata</span>`;
        const ieri = new Date(); ieri.setDate(ieri.getDate() - 1);
        const ieriString = ieri.toISOString().split('T')[0];
        const assenzaIeri = presenze.find(p => p.studenteId === studente.id && p.data === ieriString && p.stato === 'A' && !p.giustificata);
        if (assenzaIeri) { noteHtml += ` <button class="btn btn-secondary btn-sm giustifica-btn" data-presenza-id="${assenzaIeri.id}">Giustifica</button>`; }
        row.innerHTML = `<td>${studente.cognome} ${studente.nome}</td><td>${statoHtml}</td><td>${noteHtml}</td>`;
        tbody.appendChild(row);
    });
    table.querySelectorAll('.stato-appello-group button').forEach(b => b.addEventListener('click', gestisciStatoAppello));
    table.querySelectorAll('.giustifica-btn').forEach(b => b.addEventListener('click', giustificaAssenza));
}
function gestisciStatoAppello(event) {
    const { studenteId, stato } = event.target.dataset;
    if (stato === 'R') {
        apriModal('modal-ritardo', { studenteId: parseInt(studenteId) });
    } else {
        salvaPresenza(parseInt(studenteId), stato);
    }
}
// --- FINE SEZIONE CORRETTA ---

function salvaPresenza(studenteId, stato, dettagli = {}) { let presenze = getData('sim_presenze'); const recordIndex = presenze.findIndex(p => p.studenteId === studenteId && p.data === oggiString); const newRecord = { id: recordIndex > -1 ? presenze[recordIndex].id : Date.now(), studenteId, data: oggiString, stato, giustificata: stato === 'A' ? false : null, ...dettagli }; if (recordIndex > -1) presenze[recordIndex] = newRecord; else presenze.push(newRecord); setData('sim_presenze', presenze); caricaAppello(); }
function giustificaAssenza(event) { const presenzaId = parseInt(event.target.dataset.presenzaId); let presenze = getData('sim_presenze'); const recordIndex = presenze.findIndex(p => p.id === presenzaId); if (recordIndex > -1) { presenze[recordIndex].giustificata = true; setData('sim_presenze', presenze); caricaAppello(); } }
function setupVoti() { document.getElementById('crea-griglia-btn').addEventListener('click', () => apriModal('modal-griglia')); document.getElementById('salva-griglia-btn').addEventListener('click', salvaNuovaGriglia); caricaGriglieVoti(); }
function caricaGriglieVoti() { const container = document.getElementById('griglie-voti-container'); container.innerHTML = ''; const griglie = getData('sim_griglie_voti').filter(g => g.classeId === classeIdCorrente); document.getElementById('vista-griglia-dettaglio').innerHTML = ''; if (griglie.length === 0) { container.innerHTML = '<p>Nessuna griglia di valutazione creata.</p>'; return; } const table = document.createElement('table'); table.className = 'styled-table'; table.innerHTML = `<thead><tr><th>Titolo Griglia</th><th>Azioni</th></tr></thead><tbody></tbody>`; const tbody = table.querySelector('tbody'); griglie.forEach(griglia => { const row = document.createElement('tr'); row.innerHTML = `<td>${griglia.titolo}</td><td><button class="btn btn-primary" data-griglia-id="${griglia.id}">Apri</button></td>`; tbody.appendChild(row); }); container.appendChild(table); container.querySelectorAll('button').forEach(b => b.addEventListener('click', (e) => mostraDettaglioGriglia(e.target.dataset.grigliaId))); }
function salvaNuovaGriglia() { const titolo = document.getElementById('griglia-titolo').value; if (!titolo) { alert('Inserire un titolo.'); return; } const griglie = getData('sim_griglie_voti'); griglie.push({ id: Date.now(), titolo, classeId: classeIdCorrente }); setData('sim_griglie_voti', griglie); caricaGriglieVoti(); apriModal('modal-griglia', null, false); }
function mostraDettaglioGriglia(grigliaId) { grigliaId = parseInt(grigliaId); const container = document.getElementById('vista-griglia-dettaglio'); const griglia = getData('sim_griglie_voti').find(g => g.id === grigliaId); container.innerHTML = `<h4>Valutazioni per: ${griglia.titolo}</h4>`; const table = document.createElement('table'); table.className = 'styled-table griglia-voti-display'; table.innerHTML = `<thead><tr><th>Alunno</th><th>Voto</th><th>Visualizzazione</th></tr></thead><tbody></tbody>`; const tbody = table.querySelector('tbody'); const votiSalvati = getData('sim_voti'); studentiDellaClasse.forEach(studente => { const votoStudente = votiSalvati.find(v => v.grigliaId === grigliaId && v.studenteId === studente.id); const colore = votoStudente ? (votoStudente.valore < 6 ? 'v-rosso' : (votoStudente.valore == 6 ? 'v-giallo' : 'v-verde')) : ''; const row = document.createElement('tr'); row.innerHTML = `<td>${studente.cognome} ${studente.nome}</td><td><input type="number" step="0.5" min="0" max="10" value="${votoStudente ? votoStudente.valore : ''}" data-studente-id="${studente.id}"></td><td><span class="voto-display ${colore}">${votoStudente ? votoStudente.valore : ''}</span></td>`; tbody.appendChild(row); }); container.appendChild(table); container.querySelectorAll('input').forEach(input => { input.addEventListener('change', (e) => { salvaVoto(grigliaId, parseInt(e.target.dataset.studenteId), e.target.value); mostraDettaglioGriglia(grigliaId); }); }); }
function salvaVoto(grigliaId, studenteId, valore) { let voti = getData('sim_voti'); const votoIndex = voti.findIndex(v => v.grigliaId === grigliaId && v.studenteId === studenteId); if (valore) { const nuovoVoto = { grigliaId, studenteId, valore: parseFloat(valore) }; if (votoIndex > -1) voti[votoIndex] = nuovoVoto; else voti.push(nuovoVoto); } else { if (votoIndex > -1) voti.splice(votoIndex, 1); } setData('sim_voti', voti); }
function setupArgomenti() { document.getElementById('salva-argomento-btn').addEventListener('click', () => { const testo = document.getElementById('argomento-lezione').value; if(!testo) return alert('Inserire un argomento.'); const argomenti = getData('sim_argomenti'); argomenti.push({ id: Date.now(), classeId: classeIdCorrente, data: oggiString, testo }); setData('sim_argomenti', argomenti); document.getElementById('argomento-lezione').value = ''; mostraArgomentiSalvati(); }); mostraArgomentiSalvati(); }
function mostraArgomentiSalvati() { const container = document.getElementById('lista-argomenti-salvati'); const argomenti = getData('sim_argomenti').filter(a => a.classeId === classeIdCorrente); container.innerHTML = argomenti.map(a => `<div class="archivio-item"><strong>${new Date(a.data).toLocaleDateString('it-IT')}:</strong><p>${a.testo}</p></div>`).reverse().join(''); }
function setupCompiti() { document.getElementById('salva-compiti-btn').addEventListener('click', () => { const dettagli = document.getElementById('compiti-dettagli').value; const dataConsegna = document.getElementById('compiti-data-consegna').value; if(!dettagli || !dataConsegna) return alert('Inserire dettagli e data di consegna.'); const compiti = getData('sim_compiti'); compiti.push({ id: Date.now(), classeId: classeIdCorrente, data: oggiString, dettagli, dataConsegna }); setData('sim_compiti', compiti); mostraCompitiSalvati(); }); mostraCompitiSalvati(); }
function mostraCompitiSalvati() { const container = document.getElementById('lista-compiti-salvati'); const compiti = getData('sim_compiti').filter(c => c.classeId === classeIdCorrente); container.innerHTML = compiti.map(c => `<div class="archivio-item"><strong>Assegnati il ${new Date(c.data).toLocaleDateString('it-IT')} (consegna ${new Date(c.dataConsegna).toLocaleDateString('it-IT')}):</strong><p>${c.dettagli}</p></div>`).reverse().join(''); }
function setupNote() { const listaStudentiNote = document.getElementById('lista-studenti-note'); listaStudentiNote.innerHTML = ''; studentiDellaClasse.forEach(s => { listaStudentiNote.innerHTML += `<label><input type="checkbox" value="${s.id}"> ${s.cognome} ${s.nome}</label>`; }); listaStudentiNote.innerHTML += `<label>Tipo Nota: <select id="tipo-nota"><option value="disciplinare">Disciplinare</option><option value="generica">Generica</option></select></label>`; document.getElementById('salva-nota-btn').addEventListener('click', salvaNota); mostraNoteSalvate(); }
function salvaNota() { const tipoNota = document.getElementById('tipo-nota').value; const studentiSelezionatiIds = []; document.querySelectorAll('#lista-studenti-note input:checked').forEach(input => studentiSelezionatiIds.push(parseInt(input.value))); const motivazione = document.getElementById('testo-motivazione-nota').value.trim(); if (studentiSelezionatiIds.length === 0) { alert('Selezionare almeno un alunno.'); return; } if (!motivazione) { alert('Inserire una motivazione.'); return; } let note = getData('sim_note'); studentiSelezionatiIds.forEach(studenteId => { note.push({ id: Date.now() + studenteId, studenteId, classeId: classeIdCorrente, data: oggiString, motivazione, tipo: tipoNota }); }); setData('sim_note', note); alert('Nota/e salvata/e.'); document.getElementById('testo-motivazione-nota').value = ''; document.querySelectorAll('#lista-studenti-note input:checked').forEach(input => input.checked = false); mostraNoteSalvate(); }
function mostraNoteSalvate() { const container = document.getElementById('lista-note-salvate'); container.innerHTML = ''; const noteOggi = getData('sim_note').filter(n => n.classeId === classeIdCorrente && n.data === oggiString); if (noteOggi.length === 0) { container.innerHTML += '<p>Nessuna nota assegnata oggi.</p>'; return; } const table = document.createElement('table'); table.className = 'styled-table'; table.innerHTML = `<thead><tr><th>Alunno</th><th>Tipo</th><th>Motivazione</th></tr></thead><tbody></tbody>`; const tbody = table.querySelector('tbody'); noteOggi.forEach(nota => { const studente = studentiDellaClasse.find(s => s.id === nota.studenteId); if (studente) { const row = document.createElement('tr'); row.innerHTML = `<td>${studente.cognome} ${studente.nome}</td><td>${nota.tipo}</td><td>${nota.motivazione}</td>`; tbody.appendChild(row); } }); container.appendChild(table); }function apriModal(modalId, contextData = null, open = true) { const modal = document.getElementById(modalId); modal.style.display = open ? 'flex' : 'none'; if (!open) return; modal.querySelector('.close-button').onclick = () => modal.style.display = 'none'; if (modalId === 'modal-ritardo') { const minutiInput = document.getElementById('ritardo-minuti'); const giustificazioneInput = document.getElementById('ritardo-giustificazione'); minutiInput.value = ''; giustificazioneInput.value = ''; document.getElementById('salva-ritardo-btn').onclick = () => { const minuti = minutiInput.value; const giustificazione = giustificazioneInput.value; if (!minuti) { alert("Inserire i minuti di ritardo."); return; } salvaPresenza(contextData.studenteId, 'R', { minuti, giustificazione }); modal.style.display = 'none'; }; } }