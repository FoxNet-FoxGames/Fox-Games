const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = 3000;
const HOST = '192.168.178.107';

const correctPassword = "fox";
const verifiedIPs = new Set();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Hilfsfunktion zur IP-Erkennung
function clientIp(req) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
  if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
  return ip;
}

// Route für Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'FoxGames.html'));
});

// Route für /partnership ohne .html
app.get('/partnership', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'partnership.html'));
});

// Passwortüberprüfung und IP-Verifizierung
app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  const ip = clientIp(req);

  console.log(`[LOGIN] Passwort empfangen von IP: ${ip}`);

  if (password === correctPassword) {
    verifiedIPs.add(ip);
    console.log(`[ZUGELASSEN] Zugriff für IP: ${ip}`);
    res.redirect('/foxnet.html');
  } else {
    console.log(`[ABGELEHNT] Falsches Passwort von IP: ${ip}`);
    res.status(401).send("Falsches Passwort.");
  }
});

// Zugriffsschutz für foxnet.html
app.get('/foxnet.html', (req, res) => {
  const ip = clientIp(req);
  console.log(`[ZUGRIFF] foxnet.html von ${ip} | Verifiziert: ${verifiedIPs.has(ip)}`);

  if (verifiedIPs.has(ip)) {
    res.sendFile(path.join(__dirname, 'public', 'foxnet.html'));
  } else {
    res.status(403).send("Zugriff verweigert. Deine IP ist nicht verifiziert.");
  }
});

// POST-Route für Servermeldungen
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

// Server starten
app.listen(PORT, HOST, () => {
  console.log(`FoxGames Webserver läuft auf http://${HOST}:${PORT}`);
});