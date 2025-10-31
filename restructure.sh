#!/bin/bash
# Script de restructuration pour déploiement Vercel optimal

echo "🔄 Restructuration du repository pour Vercel..."

# Sauvegarde
git add . && git commit -m "Backup before restructure"

# Suppression des fichiers racine inutiles
rm -f package.json package-lock.json cleanup-config.json

# Remontée des fichiers frontend à la racine
mv frontend/* ./
mv frontend/.* ./ 2>/dev/null || true
rmdir frontend

# Mise à jour du vercel.json pour structure plate
cat > vercel.json << 'EOF'
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
EOF

# Mise à jour du .gitignore
echo "
# Vercel
.vercel
dist/
" >> .gitignore

echo "✅ Restructuration terminée"
echo "📁 Structure finale :"
echo "/"
echo "├── src/"
echo "├── public/"
echo "├── package.json"
echo "├── vite.config.ts"
echo "├── vercel.json"
echo "└── backend/ (ignoré par Vercel)"

echo ""
echo "🚀 Prochaines étapes :"
echo "1. git add ."
echo "2. git commit -m 'Restructure for Vercel deployment'"
echo "3. git push"
echo "4. Redéployer sur Vercel"
