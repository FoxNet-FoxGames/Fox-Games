const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const app = express();

const PORT = 3000;
const HOST = '0.0.0.0';

const configPath = path.join(__dirname, 'config.json');
let users = [];
if (fs.existsSync(configPath)) {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    users = JSON.parse(raw).users || [];
    console.log(`[CONFIG] ${users.length} Benutzer geladen.`);
  } catch (err) {
    console.error('[CONFIG] Fehler beim Laden von config.json:', err);
  }
} else {
  console.warn('[CONFIG] Keine config.json gefunden!');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'replace_this_with_a_strong_secret_locally',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 Stunde
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'FoxGames.html'));
});

app.post('/verify-password', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.authenticated = true;
    req.session.username = username;
    console.log(`[ZUGELASSEN] '${username}' eingeloggt`);
    return res.redirect('/foxnet.html');
  } else {
    console.log(`[ABGELEHNT] '${username}', Passwort='${password}'`);
    return res.sendStatus(401);
  }
});

app.post('/report', (req, res) => {
  const { servername, ip, reason, description, contact } = req.body;

  if (!servername || !ip || !reason || !contact) {
    return res.status(400).send("Bitte alle Pflichtfelder ausfüllen.");
  }

  const timestamp = new Date().toISOString();
  const reportText = `
===========================
Gemeldet am: ${timestamp}
Servername: ${servername}
IP-Adresse: ${ip}
Grund: ${reason}
Beschreibung: ${description || "Keine"}
Kontakt: ${contact}
===========================\n`;

  const reportFile = path.join(__dirname, 'reports', 'reports.txt');
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.appendFileSync(reportFile, reportText, 'utf8');

  res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

app.post('/bewerbung', (req, res) => {
  const data = req.body;

  // Originalname übernehmen, keine Filterung
  const nameField = Object.keys(data).find(k => k.toLowerCase().includes("name"));
  const safeName = nameField ? data[nameField] : "Unbekannt";

  // Job für Dateiname nur minimal filtern, Inhalt aber unverändert speichern
  const safeJobForFile = (data.job || "Unbekannter Job").replace(/[^a-zA-Z0-9-_ ]/g, '');

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${timestamp}-${safeName} ${safeJobForFile}.txt`;
  const filepath = path.join(__dirname, 'bewerbungen', filename);

  let content = `===========================\n`;
  content += `Bewerbung am: ${new Date().toLocaleString()}\n`;
  content += `Job: ${data.job || 'Unbekannter Job'}\n`;
  content += `Name: ${safeName}\n\n`;

  // Alle Felder direkt schreiben
  for (const key in data) {
    content += `${key}: ${data[key]}\n`;
  }
  content += `===========================\n`;

  try {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`[BEWERBUNG] ${filename} erstellt`);
    res.send({ success: true });
  } catch (err) {
    console.error('[BEWERBUNG] Fehler beim Speichern:', err);
    res.status(500).send('Fehler beim Speichern der Bewerbung');
  }
});

app.get('/api/stories', (req, res) => {
  const storyFolder = path.join(__dirname, 'public', 'assets', 'txt');
  fs.readdir(storyFolder, (err, files) => {
    if (err) {
      console.error('Fehler beim Lesen des Story-Ordners:', err);
      return res.status(500).json({ error: 'Ordner konnte nicht gelesen werden' });
    }
    // Nur .txt-Dateien
    const txtFiles = files.filter(f => f.toLowerCase().endsWith('.txt'));
    res.json(txtFiles); // Array von Dateinamen, z.B. ["Catificate.txt", "Dread.txt"]
  });
});

function parseStory(text) {
  const lines = text.split(/\r?\n/);
  const container = document.createElement('div');

  let currentCharacter = null;

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    // Editor Notes: immer weiß
    if (!line.includes(':')) {
      const note = document.createElement('p');
      note.textContent = line;
      note.classList.add('note'); // CSS für weiß leuchtend
      container.appendChild(note);
      return;
    }

    // Zeilen mit "Name: Text"
    const [namePart, speech] = line.split(/:(.+)/); // erstes ":" trennt
    let characterName = namePart.trim();
    let displaySpeech = speech.trim();

    // Voller Name vs nur Vorname
    if (characterName.includes(' ')) {
      // voller Name → Klasse und Bild ableiten
      currentCharacter = characterName.replace(/[^a-z0-9]/gi,'').toLowerCase();
    } else {
      // nur Vorname → nutze aktuellen Character
      displaySpeech = speech.trim();
    }

    // Charakterzeile erstellen
    const div = document.createElement('div');
    div.classList.add('character-line');

    const a = document.createElement('a');
    a.className = `name ${currentCharacter}`;
    a.href = `Steckbrief/${currentCharacter}.png`; // Bildlink
    a.textContent = characterName;

    const span = document.createElement('span');
    span.className = `speech ${currentCharacter}`;
    span.textContent = displaySpeech;

    div.appendChild(a);
    div.appendChild(document.createTextNode(': '));
    div.appendChild(span);
    container.appendChild(div);
  });

  return container;
}

app.listen(PORT, HOST, () => {
  console.log(`FoxGames Webserver läuft auf http://${HOST}:${PORT}`);
});