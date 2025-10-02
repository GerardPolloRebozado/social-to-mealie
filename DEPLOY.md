# 🚀 Social to Mealie Plus - Guide de déploiement

## Déploiement avec Docker Compose (Recommandé)

### Installation initiale
```bash
# Télécharger le docker-compose.yml
wget https://raw.githubusercontent.com/MaitreKuc/social-to-mealie-plus/main/docker-compose.yml

# Démarrer l'application
docker-compose up -d
```

### Gestion du container

```bash
# Redémarrer l'application (GARDE les données)
docker-compose restart

# Arrêter l'application
docker-compose down

# Redémarrer l'application (GARDE les données)
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Mettre à jour vers la dernière version
docker-compose pull
docker-compose down
docker-compose up -d
```

## Déploiement avec Docker Run

### ⚠️ IMPORTANT - Volume obligatoire pour garder vos données

```bash
# Avec volume nommé (recommandé)
docker run -d \
  --name social-to-mealie \
  --restart unless-stopped \
  -p 4000:3000 \
  -v social-to-mealie-data:/app/data \
  ghcr.io/maitrekuc/social-to-mealie-plus:latest

# Ou avec un dossier local
docker run -d \
  --name social-to-mealie \
  --restart unless-stopped \
  -p 4000:3000 \
  -v ./data:/app/data \
  ghcr.io/maitrekuc/social-to-mealie-plus:latest
```

### 📁 Persistance des données

**Le volume `-v xxx:/app/data` est OBLIGATOIRE !**

- ✅ **Avec volume** : La base de données et les configurations persistent
- ❌ **Sans volume** : Tout est perdu à chaque redémarrage

La base de données SQLite est stockée dans `/app/data/database.db` dans le container.

### Première configuration

1. Aller sur http://localhost:4000/setup
2. Créer un compte administrateur
3. Configurer les paramètres (API OpenAI, cookies Instagram, etc.)
4. L'application est prête !

### Commandes utiles

```bash
# Voir les logs
docker logs social-to-mealie -f

# Redémarrer le container
docker restart social-to-mealie

# Arrêter le container
docker stop social-to-mealie

# Supprimer le container (garde les données si volume utilisé)
docker rm social-to-mealie

# Repartir de zéro (⚠️ supprime toutes les données)
docker stop social-to-mealie
docker rm social-to-mealie
docker volume rm social-to-mealie-data  # Si volume nommé
# ou supprimer le dossier ./data si volume local
```
