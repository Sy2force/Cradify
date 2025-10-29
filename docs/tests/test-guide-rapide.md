# 🚀 Guide Test Rapide - Cardifyy

## Inscription et Connexion Fluide

### 📝 **Test 1: Inscription (2 minutes)**

1. Ouvrir: [Page d'inscription](`https://cardifyy-app.netlify.app/register`)
2. Remplir avec ces données de test:
   - **Prénom:** Jean
   - **Nom:** Dupont  
   - **Email:** `jean.dupont.test@cardifyy.com`
   - **Mot de passe:** MonMotDePasse123
   - **Téléphone:** +33612345678
   - **Pays:** France
   - **Ville:** Paris
   - **Rue:** 123 Rue de la Paix
   - **Numéro:** 45
   - **Code postal:** 75001
   - ✅ **Cocher "Compte Business"**

3. **Résultat attendu:** Message "Inscription réussie ! (mode démo)" + redirection automatique

---

### 🔑 **Test 2: Connexion (30 secondes)**

1. Aller sur: [Page de connexion](`https://cardifyy-app.netlify.app/login`)
2. Saisir:
   - **Email:** `jean.dupont.test@cardifyy.com`
   - **Mot de passe:** MonMotDePasse123

3. **Résultat attendu:** Connexion immédiate + redirection vers homepage

---

### 🏠 **Test 3: Navigation Header (1 minute)**

1. Vérifier le header affiche: **"Jean Dupont"**
2. Voir initiales **"JD"** ou avatar
3. Cliquer sur le nom → menu profil apparaît
4. **Navigation testée:** Accueil, Cartes, Créer une carte, Profil

---

### 👤 **Test 4: Profil Auto-Save (1 minute)**

1. Aller sur: [Page profil](`https://cardifyy-app.netlify.app/profile`)
2. Modifier:
   - **Avatar URL:** `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300`
   - **Téléphone:** `+33698765432`
3. **Attendre 2 secondes** → Notification "Profil sauvegardé ! (mode démo)"
4. **Vérifier:** Avatar s'affiche dans le header

---

### ➕ **Test 5: Création Carte (2 minutes)**

1. Aller sur: [Page création de carte](`https://cardifyy-app.netlify.app/create-card`)
2. Remplir:
   - **Titre:** Jean Dupont
   - **Sous-titre:** Consultant Digital
   - **Description:** Expert en transformation numérique
   - **Email:** `jean@dupont-conseil.fr`
   - **Téléphone:** +33612345678
   - **Site web:** `https://dupont-conseil.fr`
   - **Pays/Ville:** France, Paris

3. **Résultat:** "Carte créée avec succès ! (mode démo)" + redirection

---

### 🔄 **Test 6: Persistance (30 secondes)**

1. **Recharger la page** (F5)
2. **Vérifier:** Utilisateur toujours connecté
3. **Naviguer** entre les pages → données conservées

---

## ✅ **Critères de Succès**

- [ ] Inscription sans erreur
- [ ] Connexion immédiate  
- [ ] Header personnalisé visible
- [ ] Sauvegarde auto profil
- [ ] Création carte fonctionnelle
- [ ] Persistance après rechargement

## 🎯 **Résultat Attendu**

## Résultat Final

6/6 tests réussis = Application 100% fonctionnelle pour démonstration

---

## Notes

Tests optimisés pour mode démo - Durée totale: ~7 minutes
