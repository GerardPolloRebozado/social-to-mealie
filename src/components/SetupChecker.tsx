'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SetupChecker({ children }: { children: React.ReactNode }) {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ne vérifier que si on n'est pas déjà sur la page setup
    if (pathname.startsWith('/setup')) {
      setIsSetupComplete(true); // Permettre l'accès à la page setup
      return;
    }

    const checkSetup = async () => {
      try {
        const response = await fetch('/api/setup/check');
        const data = await response.json();
        
        if (!data.hasUsers) {
          router.push('/setup');
        } else {
          setIsSetupComplete(true);
        }
      } catch (error) {
        console.error('Error checking setup:', error);
        // En cas d'erreur, rediriger vers setup
        router.push('/setup');
      }
    };

    checkSetup();
  }, [pathname, router]);

  // Afficher un loader pendant la vérification
  if (isSetupComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Vérification de la configuration...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
