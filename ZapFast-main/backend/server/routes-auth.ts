import type { Express } from "express";
import { registerUser, loginUser } from "./auth";
import { storage } from "./storage";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export function registerAuthRoutes(app: Express) {
  // Rota de registro
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: validation.error.errors[0].message,
        });
        return;
      }

      const { email, password, firstName, lastName } = validation.data;
      
      const result = await registerUser(email, password, firstName, lastName);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Criar sessão
      (req.session as any).userId = result.user!.id;
      (req.session as any).userEmail = result.user!.email;
      
      res.json(result);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  // Rota de login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: validation.error.errors[0].message,
        });
        return;
      }

      const { email, password } = validation.data;
      
      const result = await loginUser(email, password);
      
      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      // Criar sessão
      (req.session as any).userId = result.user!.id;
      (req.session as any).userEmail = result.user!.email;
      
      res.json(result);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  // Rota de logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: "Erro ao fazer logout",
        });
        return;
      }
      
      res.json({ success: true });
    });
  });

  // Rota para verificar sessão e obter dados do usuário
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
        return;
      }

      // Buscar dados completos do usuário no banco
      const user = await storage.getUser(userId);
      
      if (!user) {
        // Sessão existe mas usuário não está mais no banco
        req.session.destroy((err) => {
          if (err) console.error("Erro ao destruir sessão:", err);
        });
        
        res.status(401).json({
          success: false,
          error: "Usuário não encontrado",
        });
        return;
      }

      // Verificar se o plano expirou
      if (user.isBlocked) {
        res.status(403).json({
          success: false,
          error: "Conta bloqueada. Entre em contato com o suporte.",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            nickname: user.nickname,
            isBlocked: true,
          },
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          nickname: user.nickname,
          planType: user.planType,
          planExpiresAt: user.planExpiresAt,
          isBlocked: user.isBlocked,
        },
      });
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  // Rota para atualizar perfil do usuário
  app.put("/api/auth/profile", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
        return;
      }

      const { firstName, lastName, nickname } = req.body;

      // Validar dados
      if (firstName && firstName.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Nome não pode ser vazio",
        });
        return;
      }

      // Atualizar usuário
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (nickname !== undefined) updateData.nickname = nickname.trim();

      const updatedUser = await storage.updateUser(userId, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          nickname: updatedUser.nickname,
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao atualizar perfil",
      });
    }
  });
}
