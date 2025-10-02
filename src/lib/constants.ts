import type { envTypes } from '@//lib/types';
import { prisma } from './db';

// Cache des configurations avec un TTL de 5 minutes
let configCache: { [key: string]: { value: string; timestamp: number } } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes en millisecondes

const getConfigValue = async (key: string): Promise<string> => {
  const now = Date.now();
  
  // Vérifier si la valeur est en cache et toujours valide
  if (configCache[key] && (now - configCache[key].timestamp) < CACHE_TTL) {
    return configCache[key].value;
  }

  // Sinon, charger depuis la base de données
  const config = await prisma.config.findUnique({ where: { key } });
  const value = config?.value || process.env[key]?.trim() || '';
  
  // Mettre en cache
  configCache[key] = { value, timestamp: now };
  
  return value;
};

export const getEnv = async (): Promise<envTypes> => {
  const configs = await Promise.all([
    getConfigValue('OPENAI_URL'),
    getConfigValue('OPENAI_API_KEY'),
    getConfigValue('WHISPER_MODEL'),
    getConfigValue('MEALIE_URL'),
    getConfigValue('MEALIE_API_KEY'),
    getConfigValue('USER_PROMPT'),
    getConfigValue('EXTRA_PROMPT'),
    getConfigValue('COOKIES_PATH')
  ]);

  return {
    OPENAI_URL: configs[0],
    OPENAI_API_KEY: configs[1],
    WHISPER_MODEL: configs[2],
    MEALIE_URL: configs[3],
    MEALIE_API_KEY: configs[4],
    USER_PROMPT: configs[5],
    EXTRA_PROMPT: configs[6],
    COOKIES_PATH: configs[7]
  };
};

// Valeurs par défaut pour le côté client
export const env: envTypes = {
  OPENAI_URL: '',
  OPENAI_API_KEY: '',
  WHISPER_MODEL: '',
  MEALIE_URL: '',
  MEALIE_API_KEY: '',
  USER_PROMPT: '',
  EXTRA_PROMPT: '',
  COOKIES_PATH: ''
};

// Fonction pour rafraîchir les configurations
export const refreshEnv = async () => {
  const newConfig = await getEnv();
  Object.assign(env, newConfig);
  return newConfig;
};

// Initialisation des configurations au démarrage
refreshEnv().catch(console.error);