const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const app = express();

const PORT = 3000;
const HOST = '192.168.178.107';

// === Config laden ===
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

// === Middleware ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'replace_this_with_a_strong_secret_locally',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 Stunde
}));

// === Login-Seite ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'FoxGames.html'));
});

// Partnership-Seite
app.get('/partnership', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'partnership.html'));
});

// === Login prüfen ===
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

// === Reports ===
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

  if(!data.name || !data.job) return res.status(400).send('Name oder Job fehlt');

  const timestamp = new Date().toISOString().replace(/:/g,'-');
  const safeName = data.name.replace(/[^a-zA-Z0-9-_ ]/g,'');
  const safeJob = data.job.replace(/[^a-zA-Z0-9-_ ]/g,'');
  const filename = `${timestamp}-${safeName} ${safeJob}.txt`;
  const filepath = path.join(__dirname, 'bewerbungen', filename);

  // Alle Antworten schön formatieren
  let content = `===========================\n`;
  content += `Bewerbung am: ${new Date().toLocaleString()}\n`;
  content += `Job: ${data.job}\n`;
  content += `Name: ${data.name}\n\n`;

  // Alle anderen Felder
  for(const key in data){
    if(key === 'name' || key === 'job') continue;
    content += `${key}: ${data[key]}\n`;
  }

  content += `===========================\n`;

  try {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`[BEWERBUNG] ${filename} erstellt`);
    res.send({ success: true });
  } catch(err) {
    console.error('[BEWERBUNG] Fehler beim Speichern:', err);
    res.status(500).send('Fehler beim Speichern der Bewerbung');
  }
});

// === Server starten ===
app.listen(PORT, HOST, () => {
  console.log(`FoxGames Webserver läuft auf http://${HOST}:${PORT}`);
});