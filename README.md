# Home Library - Responzivní webová aplikace pro sledování knih

Responzivní webová aplikace pro sledování osobní knihovny pro pár uživatelů. Inspirováno aplikací Booxy.

## ✨ Funkce

- 📚 **Správa knih**: Přidávání, editace, mazání knih
- 🔍 **Vyhledávání**: Integrace s Google Books API
- 📊 **Statistiky**: Grafy, čtecí cíle, oblíbení autoři
- 🎨 **Responzivní design**: Perfektní na desktop, tablet i mobil
- 🌙 **Dark mode**: Automatické nebo manuální přepínání
- 👥 **Sdílení**: Oba uživatelé vidí všechny knihy
- ⭐ **Hodnocení**: 1-5 hvězdiček pro každou knihu
- 📝 **Poznámky**: Osobní poznámky k jednotlivým knihám
- 📱 **PWA ready**: Instalovatelná jako aplikace

## 🛠️ Technologie

- **Frontend**: Next.js 14+ (App Router) + React 18+
- **Styling**: Tailwind CSS (plně responzivní)
- **Backend**: Firebase (Firestore + Authentication + Storage)
- **API**: Google Books API
- **UI**: shadcn/ui komponenty
- **Grafy**: Recharts
- **Icons**: Lucide React

## 🚀 Rychlý start

### 1. Instalace závislostí

```bash
npm install
```

### 2. Firebase Setup

1. Vytvořte projekt na [Firebase Console](https://console.firebase.google.com/)
2. Povolte Authentication (Email/Password a Google)
3. Vytvořte Firestore databázi
4. Zkopírujte `.env.example` na `.env.local` a vyplňte hodnoty

### 3. Firestore Security Rules

Nahrajte `firestore.rules` do Firebase Console (Firestore > Rules).

### 4. Whitelist Setup

Vytvořte dokument v Firestore:
- Collection: `settings`
- Document ID: `whitelist`
- Data: `{ "allowedEmails": ["email1@example.com", "email2@example.com"] }`

### 5. Spuštění

```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000)

## 📖 Dokumentace

Více informací najdete v [SETUP.md](./SETUP.md)

## 📱 Responzivní Design

- **Mobile** (< 640px): Single column, bottom navigation
- **Tablet** (640-1024px): 2-3 column grid, tabs navigation
- **Desktop** (> 1024px): Multi-column layout, sidebar navigation

## 🔒 Bezpečnost

- Whitelist kontrola emailů (pouze 2 uživatelé)
- Firestore security rules
- Ověření vlastnictví při editaci/mazání knih

## 📦 Deployment

### Vercel (doporučeno)

1. Push na GitHub
2. Import do Vercel
3. Přidejte environment variables
4. Deploy!

Více v [SETUP.md](./SETUP.md)
