// File: js/dati.js (VERSIONE FINALE - VERIFICATA)

const materie = [ { id: 1, nome: "Matematica" }, { id: 2, nome: "Fisica" }, { id: 3, nome: "Scienze Naturali" }, { id: 4, nome: "Italiano" }, { id: 5, nome: "Latino" }, { id: 6, nome: "Storia e Geografia" }, { id: 7, nome: "Filosofia" }, { id: 8, nome: "Inglese" }, { id: 9, nome: "Disegno e Storia dell'Arte" }, { id: 10, nome: "Scienze Motorie" }, { id: 11, nome: "Religione Cattolica" }, { id: 12, nome: "Informatica" }, { id: 13, nome: "Diritto ed Economia" } ];

const docenti = [
    { id: "doc_sys_01", nome: "Gabriele", cognome: "Culotta", email: "gabrieleculotta@isspiolatorre.edu.it", password: "gabrielepiolatorrexx_.edu.it", materie: [10], status: 'active', motivation: null },
    { id: "doc_sys_02", nome: "Marco", cognome: "Fintini", email: "marcofintini@isspiolatorre.edu.it", password: "piolatorre.2432x_124", materie: [3], status: 'active', motivation: null },
    { id: "doc_sys_03", nome: "Alessio", cognome: "Ferrara", email: "alessioferrara@isspiolatorre.edu.it", password: "alessioferrara_105010", materie: [1], status: 'active', motivation: null },
    { id: "doc_sys_04", nome: "Marco", cognome: "Del Valle", email: "marcodelvalle@isspiolatorre.edu.it", password: "marcodelvalle_204010", materie: [13], status: 'active', motivation: null },
    { id: "doc_sys_05", nome: "Francesco", cognome: "Durante", email: "francescodurante@isspiolatorre.edu.it", password: "admin1234", materie: [4, 5], status: 'active', motivation: null }
];

const classi = [];
const alunni = [];
const orario = [];