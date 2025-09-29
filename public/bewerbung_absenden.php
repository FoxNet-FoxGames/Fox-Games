<?php
// Empfänger-Mailadresse
$empfaenger = "foxgames@web.de";
$betreff = "$name\n (Bewerbung): Globaler Moderator";

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