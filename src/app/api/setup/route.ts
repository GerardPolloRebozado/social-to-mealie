import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    // Vérifier s'il y a déjà des utilisateurs
    const existingUsers = await prisma.user.count();
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: "Un utilisateur existe déjà. L'installation a déjà été effectuée." },
        { status: 400 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Nom d'utilisateur et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    });

    console.log(`Premier utilisateur créé: ${username}`);

    return NextResponse.json({ 
      success: true, 
      message: "Compte administrateur créé avec succès" 
    });

  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
