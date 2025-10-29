#!/bin/bash

# 🔧 Script de Maintenance Cardify
# Auteur: Shaya Coca
# Description: Script de maintenance complète du projet

set -e

echo "🚀 Démarrage de la maintenance Cardify..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    log_success "Prérequis validés"
}

# Nettoyage des fichiers temporaires
clean_temp_files() {
    log_info "Nettoyage des fichiers temporaires..."
    
    # Suppression des logs
    find . -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null || true
    
    # Suppression des fichiers de cache
    find . -name ".DS_Store" -delete 2>/dev/null || true
    find . -name "Thumbs.db" -delete 2>/dev/null || true
    find . -name "*.tmp" -delete 2>/dev/null || true
    
    # Nettoyage des dossiers de build
    rm -rf frontend/dist 2>/dev/null || true
    rm -rf backend/coverage 2>/dev/null || true
    
    log_success "Fichiers temporaires nettoyés"
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    # Root
    npm install
    
    # Backend
    cd backend
    npm install
    cd ..
    
    # Frontend
    cd frontend
    npm install
    cd ..
    
    log_success "Dépendances installées"
}

# Audit de sécurité
security_audit() {
    log_info "Audit de sécurité..."
    
    # Backend
    cd backend
    if npm audit --audit-level=high; then
        log_success "Backend: Aucune vulnérabilité critique"
    else
        log_warning "Backend: Vulnérabilités détectées"
    fi
    cd ..
    
    # Frontend
    cd frontend
    if npm audit --audit-level=high; then
        log_success "Frontend: Aucune vulnérabilité critique"
    else
        log_warning "Frontend: Vulnérabilités détectées"
    fi
    cd ..
}

# Vérification du linting
check_linting() {
    log_info "Vérification du code (linting)..."
    
    # Backend
    cd backend
    if npm run lint; then
        log_success "Backend: Code conforme"
    else
        log_warning "Backend: Problèmes de linting détectés"
    fi
    cd ..
    
    # Frontend
    cd frontend
    if npm run lint; then
        log_success "Frontend: Code conforme"
    else
        log_warning "Frontend: Problèmes de linting détectés"
    fi
    cd ..
}

# Tests
run_tests() {
    log_info "Exécution des tests..."
    
    # Backend
    cd backend
    if npm test; then
        log_success "Backend: Tous les tests passent"
    else
        log_error "Backend: Échec des tests"
    fi
    cd ..
}

# Build de production
production_build() {
    log_info "Build de production..."
    
    cd frontend
    if npm run build; then
        log_success "Frontend: Build réussi"
    else
        log_error "Frontend: Échec du build"
        exit 1
    fi
    cd ..
}

# Vérification des dépendances obsolètes
check_outdated() {
    log_info "Vérification des dépendances obsolètes..."
    
    echo "📦 Backend:"
    cd backend
    npm outdated || true
    cd ..
    
    echo "📦 Frontend:"
    cd frontend
    npm outdated || true
    cd ..
}

# Fonction principale
main() {
    echo "🎯 Maintenance Cardify - $(date)"
    echo "=================================="
    
    check_prerequisites
    clean_temp_files
    install_dependencies
    security_audit
    check_linting
    run_tests
    production_build
    check_outdated
    
    echo "=================================="
    log_success "Maintenance terminée avec succès!"
    echo "🚀 Projet prêt pour le déploiement"
}

# Gestion des arguments
case "${1:-}" in
    "clean")
        clean_temp_files
        ;;
    "install")
        install_dependencies
        ;;
    "audit")
        security_audit
        ;;
    "lint")
        check_linting
        ;;
    "test")
        run_tests
        ;;
    "build")
        production_build
        ;;
    "outdated")
        check_outdated
        ;;
    *)
        main
        ;;
esac
