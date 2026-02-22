# TransCraft

**Relisez mieux. Traduisez dans toutes les langues.**

TransCraft est une application web de relecture et de traduction professionnelle propulsee par l'intelligence artificielle. Elle offre un cycle fluide du brouillon au texte final.

---

## Fonctionnalites

### Relecture (Editor)
- Detection automatique des erreurs de grammaire, d'orthographe et de style
- Prise en charge de plus de 20 langues (anglais, francais, allemand, espagnol, portugais, arabe, etc.)
- Suggestions IA individuelles : accepter ou rejeter chaque correction
- Propulse par [LanguageTool](https://languagetool.org/) et l'API Claude d'Anthropic

### Traduction (Translate)
- Traduction contextuelle dans plus de 100 langues
- Preservation du ton, du formatage et de la terminologie technique
- Interface complete avec selection de fournisseurs et de modeles IA

### Page d'accueil
- Presentation des deux outils (Relecture et Traduction)
- Navigation intuitive et design moderne (theme sombre)

---

## Structure du projet

```
TransCraft/
├── web/
│   ├── landing.html      # Page d'accueil
│   ├── index.html         # Outil de relecture (Editor)
│   └── translate.html     # Outil de traduction (iframe)
├── backend/
│   ├── main.py            # Serveur FastAPI (proxy LanguageTool)
│   └── requirements.txt   # Dependances Python
├── frontend/
│   ├── src/               # Application React (Vite)
│   └── package.json       # Dependances Node.js
└── .gitignore
```

---

## Installation et lancement

### Prerequis
- Python 3.12+
- Node.js 18+
- Java 11+ (pour LanguageTool)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001
```

### Frontend (developpement)

```bash
cd frontend
npm install
npm run dev
```

### Serveur web (pages statiques)

```bash
npx serve web -l 8080
```

### Acces

| Page | URL |
|---|---|
| Accueil | `http://localhost:8080/landing.html` |
| Relecture | `http://localhost:8080/index.html` |
| Traduction | `http://localhost:8080/translate.html` |

---

## Technologies

- **Frontend** : HTML/CSS/JS natif (pages web), React 19 + Vite (application)
- **Backend** : FastAPI (Python)
- **Relecture** : LanguageTool (serveur local, hors ligne)
- **IA** : API Claude d'Anthropic (relecture avancee)
- **Traduction** : Moteur de traduction multi-fournisseurs

---

## Licence

GPLv3 — Voir le fichier [COPYING](COPYING).
