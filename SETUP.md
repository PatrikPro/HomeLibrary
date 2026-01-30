# Setup Guide - Home Library

## 1. Instalace závislostí

```bash
npm install
```

## 2. Firebase Setup

1. Vytvořte nový projekt na [Firebase Console](https://console.firebase.google.com/)
2. Povolte Authentication (Email/Password a Google)
3. Vytvořte Firestore databázi
4. Zkopírujte Firebase konfiguraci do `.env.local`:

```bash
cp .env.example .env.local
```

Vyplňte hodnoty z Firebase Console.

## 3. Firestore Security Rules

Nahrajte `firestore.rules` do Firebase Console (Firestore > Rules).

## 4. Whitelist Setup

Vytvořte dokument v Firestore:
- Collection: `settings`
- Document ID: `whitelist`
- Data:
```json
{
  "allowedEmails": [
    "email1@example.com",
    "email2@example.com"
  ]
}
```

## 5. Spuštění aplikace

```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000)

## 6. PWA Icons (volitelné)

Pro PWA funkce vytvořte ikony:
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)

Můžete použít nástroj jako [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

## 7. Deployment

### Vercel (doporučeno)

1. Push kód na GitHub
2. Importujte projekt do Vercel
3. Přidejte environment variables z `.env.local`
4. Deploy!

### Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

## Poznámky

- Aplikace je určena pouze pro 2 uživatele (whitelist)
- První 2 uživatelé se mohou automaticky zaregistrovat (pokud whitelist neexistuje)
- Všechny knihy jsou viditelné pro oba uživatele, ale editovat lze pouze své vlastní
