import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User } from "../shared/schema";

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Verificar se o email já existe
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "E-mail já cadastrado" };
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Criar usuário
    const user = await storage.createUser({
      email,
      password: passwordHash,
      firstName,
      lastName: lastName || "",
      planType: "free",
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
        firstName: user.firstName!,
        lastName: user.lastName || undefined,
      },
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Erro ao criar conta" };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return { success: false, error: "E-mail ou senha incorretos" };
    }

    // Verificar se o usuário tem senha cadastrada
    if (!user.password) {
      return { success: false, error: "Usuário sem senha cadastrada" };
    }

    // Verificar senha
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      return { success: false, error: "E-mail ou senha incorretos" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
        firstName: user.firstName!,
        lastName: user.lastName || undefined,
      },
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, error: "Erro ao fazer login" };
  }
}
