<?php
// Empfänger-Mailadresse
$empfaenger = "foxgames@web.de";
$betreff = "Neue Bewerbung: Globaler Moderator";

// Formularfelder auslesen
$name = trim($_POST['name'] ?? '');
$age = trim($_POST['age'] ?? '');
$discord = trim($_POST['discord'] ?? '');
$language = trim($_POST['language'] ?? '');
$experience = trim($_POST['experience'] ?? '');
$motivation = trim($_POST['motivation'] ?? '');
$conflict = trim($_POST['conflict'] ?? '');
$strengths = trim($_POST['strengths'] ?? '');
$time = trim($_POST['time'] ?? '');
$situation = trim($_POST['situation'] ?? '');
$future = trim($_POST['future'] ?? '');
$cheat = trim($_POST['cheat'] ?? '');

// Header-Injection verhindern
function safeHeader($string) {
    return str_replace(["\r", "\n"], '', $string);
}

// E-Mail-Text erstellen
$nachricht = "Neue Bewerbung als Globaler Moderator:\n\n";
$nachricht .= "Name: $name\n";
$nachricht .= "Alter: $age\n";
$nachricht .= "Discord: $discord\n";
$nachricht .= "Sprachen: $language\n\n";
$nachricht .= "Moderationserfahrung:\n$experience\n\n";
$nachricht .= "Motivation:\n$motivation\n\n";
$nachricht .= "Konfliktlösung:\n$conflict\n\n";
$nachricht .= "Stärken/Schwächen:\n$strengths\n\n";
$nachricht .= "Tägliche Aktivität:\n$time\n\n";
$nachricht .= "Verantwortungssituation:\n$situation\n\n";
$nachricht .= "Zukunft in der Community:\n$future\n\n";
$nachricht .= "Empfehlung durch Mitglied:\n$cheat\n\n";

// E-Mail-Header
$header = "From: " . safeHeader($discord) . "@example.com\r\n";
$header .= "Reply-To: " . safeHeader($discord) . "@example.com\r\n";

// E-Mail versenden und Erfolg/Fehler-Seite anzeigen
if(mail($empfaenger, $betreff, $nachricht, $header)) {
    $message = "Vielen Dank für deine Bewerbung! Wir werden uns zeitnah bei dir melden.";
    $color = "#00dc3c"; // grün
} else {
    $message = "Beim Versenden ist ein Fehler aufgetreten. Bitte versuche es später erneut.";
    $color = "#ff0000"; // rot
}
?>

<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Bewerbung</title>
<style>
body { margin:0; background-color:#000; color:#fff; font-family:Arial, sans-serif; text-align:center; }
header img.logo { width:200px; display:block; margin: 2rem auto 1rem; }
header img.title { max-width:60%; height:auto; display:block; margin:auto; }
.message-container {
  background: linear-gradient(135deg, #111, #1a1a1a);
  border-radius:20px;
  padding:3rem;
  margin:4rem auto;
  max-width:600px;
  box-shadow:0 0 25px rgba(255,0,128,0.4);
  text-align:center;
}
.message-container h2 { font-size:2rem; color:<?php echo $color; ?>; text-shadow:0 0 10px #000; margin-bottom:1.5rem; }
.message-container p { font-size:1.2rem; color:#ccc; line-height:1.5; }
a.back { display:inline-block; margin-top:2rem; padding:0.8rem 2rem; border-radius:10px; background: linear-gradient(135deg,#ff0000,#ff6600); color:#fff; font-weight:bold; text-decoration:none; transition:all 0.3s ease; }
a.back:hover { transform:scale(1.05); box-shadow:0 0 15px rgba(255,100,0,0.7); }
footer { background:#111; text-align:center; padding:1rem; font-size:0.9rem; color:#888; margin-top:3rem; }
</style>
</head>
<body>
<header>
  <img src="../assets/Fox Games Logo.png" alt="Logo" class="logo">
  <img src="../assets/Fox Games Title.png" alt="Titel" class="title">
</header>

<div class="message-container">
  <h2><?php echo $message; ?></h2>
  <p>Du kannst jetzt zur Startseite zurückkehren oder weitere Aktionen durchführen.</p>
  <a class="back" href="index.html">Zurück zur Startseite</a>
</div>

<footer>
  <p>© 2025 Fox Games</p>
</footer>
</body>
</html>
