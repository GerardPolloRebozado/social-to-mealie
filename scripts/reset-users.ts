import { prisma } from '../src/lib/db';

async function resetDatabase() {
  try {
    console.log('🗑️  Suppression de tous les utilisateurs...');
    await prisma.user.deleteMany({});
    
    const userCount = await prisma.user.count();
    console.log(`✅ Base réinitialisée. Nombre d'utilisateurs: ${userCount}`);
    
    console.log('🎯 Vous pouvez maintenant tester la page de setup!');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
