# Nastavení Firestore Whitelist

## Metoda 1: Přes Firebase Console (nejjednodušší)

1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt **homelibrary-55bb3**
3. V levém menu klikněte na **Firestore Database**
4. Klikněte na **Start collection** (nebo pokud už máte data, klikněte na **+ Add collection**)
5. Zadejte:
   - **Collection ID**: `settings`
   - Klikněte **Next**
6. Vytvořte dokument:
   - **Document ID**: `whitelist`
   - Klikněte **Next**
7. Přidejte pole:
   - **Field**: `allowedEmails`
   - **Type**: vyberte **array**
   - **Value**: přidejte emaily jako prvky pole:
     ```
     email1@example.com
     email2@example.com
     ```
   - Klikněte **Save**

Výsledek by měl vypadat takto:
```
Collection: settings
  └── Document: whitelist
      └── allowedEmails: [email1@example.com, email2@example.com]
```

## Metoda 2: Přes Firebase CLI

Pokud máte nainstalovaný Firebase CLI:

```bash
# Přihlaste se
firebase login

# Inicializujte projekt (pokud ještě není)
firebase init firestore

# Vytvořte soubor init-firestore.js
```

Vytvořte soubor `init-firestore.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupWhitelist() {
  await db.collection('settings').doc('whitelist').set({
    allowedEmails: [
      'email1@example.com',
      'email2@example.com'
    ]
  });
  console.log('Whitelist created successfully!');
}

setupWhitelist();
```

Spusťte:
```bash
node init-firestore.js
```

## Metoda 3: Přes webovou aplikaci (dočasně)

Můžete také dočasně upravit `firestore.rules` a vytvořit dokument přes aplikaci, ale to není doporučeno pro produkci.

## Ověření

Po vytvoření dokumentu můžete ověřit v Firebase Console, že dokument existuje:
- Collection: `settings`
- Document: `whitelist`
- Pole: `allowedEmails` (array s 2 emaily)

## Důležité poznámky

- **Emaily musí být přesně stejné** jako ty, které uživatelé použijí při registraci
- Pokud whitelist neexistuje, aplikace povolí prvním 2 uživatelům registraci automaticky
- Po vytvoření whitelistu už se další uživatelé nebudou moci zaregistrovat

## Aktualizace whitelistu

Chcete-li přidat nebo změnit emaily:
1. Jděte do Firebase Console > Firestore Database
2. Najděte `settings/whitelist`
3. Klikněte na dokument
4. Upravte pole `allowedEmails`
5. Klikněte **Update**
