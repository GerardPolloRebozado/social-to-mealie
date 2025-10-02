'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Config } from "@prisma/client";
import { env } from "@/lib/constants";

export default function ConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultConfigs = {
    OPENAI_URL: env.OPENAI_URL || "",
    OPENAI_API_KEY: env.OPENAI_API_KEY || "",
    WHISPER_MODEL: env.WHISPER_MODEL || "",
    MEALIE_URL: env.MEALIE_URL || "",
    MEALIE_API_KEY: env.MEALIE_API_KEY || "",
    USER_PROMPT: env.USER_PROMPT || "",
    EXTRA_PROMPT: env.EXTRA_PROMPT || "",
    COOKIES_PATH: env.COOKIES_PATH || "",
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch("/api/config");
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error("Failed to fetch configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    for (const [key, value] of formData.entries()) {
      if (!value) continue;
      
      try {
        await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        });
      } catch (error) {
        console.error(`Failed to update ${key}:`, error);
      }
    }
    
    fetchConfigs();
  };

  const getValue = (key: string) => {
    const config = configs.find((c) => c.key === key);
    return config?.value || defaultConfigs[key as keyof typeof defaultConfigs] || "";
  };

  const configDescriptions = {
    OPENAI_URL: "OpenAI API URL (e.g., https://api.openai.com/v1)",
    OPENAI_API_KEY: "Your OpenAI API key",
    WHISPER_MODEL: "Whisper model to use (e.g., whisper-1)",
    MEALIE_URL: "Mealie instance URL (e.g., https://mealie.example.com)",
    MEALIE_API_KEY: "Your Mealie API key",
    USER_PROMPT: "Custom user prompt for recipe generation",
    EXTRA_PROMPT: "Additional prompt for recipe generation",
    COOKIES_PATH: "Path to cookies.txt file for social media authentication (e.g., C:\\path\\to\\cookies.txt)",
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Configuration</h1>
      
      {/* Instructions pour les cookies */}
      <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-950">
        <h2 className="text-lg font-semibold mb-3">📁 Configuration des Cookies pour l'Authentification</h2>
        <div className="text-sm space-y-2">
          <p><strong>Pour Instagram, TikTok, YouTube et autres :</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Installez l'extension <strong>"Get cookies.txt LOCALLY"</strong> dans votre navigateur</li>
            <li>Connectez-vous au site web (Instagram, TikTok, etc.)</li>
            <li>Utilisez l'extension pour exporter le fichier cookies.txt</li>
            <li>Entrez le chemin complet vers ce fichier dans le champ <strong>COOKIES_PATH</strong> ci-dessous</li>
          </ol>
          <p className="mt-3"><strong>Exemple :</strong> <code>C:\Users\VotreNom\Downloads\cookies.txt</code></p>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(defaultConfigs).map(([key]) => (
            <div key={key} className="space-y-2">
              <label htmlFor={key} className="block font-medium">
                {key}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {configDescriptions[key as keyof typeof configDescriptions]}
              </p>
              <Input
                type={key.includes('API_KEY') ? 'password' : 'text'}
                id={key}
                name={key}
                defaultValue={getValue(key)}
                className="w-full"
                placeholder={configDescriptions[key as keyof typeof configDescriptions]}
              />
            </div>
          ))}
          <Button type="submit" className="w-full">
            Save Configuration
          </Button>
        </form>
      </Card>
    </div>
  );
}
