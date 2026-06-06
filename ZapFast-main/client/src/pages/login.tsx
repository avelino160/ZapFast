import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Mail, Lock, Eye, EyeClosed, ArrowRight, User, ArrowLeft, Send } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import logoHeader from "@assets/logo-dashboard-old.png";

type View = "login" | "register" | "forgot";

function GlassInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full bg-white/5 border border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 rounded-lg px-3 transition-all duration-300 outline-none focus:bg-white/10 text-sm",
        className
      )}
      {...props}
    />
  );
}

function LightBeams() {
  return (
    <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent"
        animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
        transition={{ left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" } }}
      />
      <motion.div
        className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent"
        animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
        transition={{ top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 } }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent"
        animate={{ right: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
        transition={{ right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 } }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent"
        animate={{ bottom: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
        transition={{ bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 } }}
      />
    </div>
  );
}

export default function Login() {
  const [view, setView] = useState<View>("login");
  const [, setLocation] = useLocation();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginFocused, setLoginFocused] = useState<string | null>(null);

  // Register state
  const [regName, setRegName] = useState("");
  const [regSurname, setRegSurname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regPasswordError, setRegPasswordError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regFocused, setRegFocused] = useState<string | null>(null);

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoginLoading(true);

    localStorage.setItem("demo_user_email", loginEmail);
    if (!localStorage.getItem("demo_user_name")) {
      localStorage.setItem("demo_user_name", "Usuário");
    }
    localStorage.setItem("demo_logged_in", "true");

    setTimeout(() => setLocation("/dashboard"), 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regSurname || !regEmail || !regPassword || !regConfirmPassword) return;
    if (regPassword !== regConfirmPassword) {
      setRegPasswordError("As senhas não coincidem");
      return;
    }
    setRegPasswordError("");
    setRegLoading(true);

    localStorage.setItem("demo_user_email", regEmail);
    localStorage.setItem("demo_user_name", regName.trim());
    localStorage.setItem("demo_user_surname", regSurname.trim());
    localStorage.setItem("demo_logged_in", "true");

    setTimeout(() => setLocation("/dashboard"), 600);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setTimeout(() => { setForgotLoading(false); setForgotSent(true); }, 1500);
  };

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, backgroundSize: "200px 200px" }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-purple-300/20 blur-[60px]" animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }} />
      <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-purple-400/20 blur-[60px]" animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }} />
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10 px-4"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative group">
            <motion.div className="absolute -inset-[1px] rounded-2xl" animate={{ boxShadow: ["0 0 10px 2px rgba(255,255,255,0.03)", "0 0 15px 5px rgba(255,255,255,0.05)", "0 0 10px 2px rgba(255,255,255,0.03)"], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }} />
            <LightBeams />

            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.05] shadow-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`, backgroundSize: "30px 30px" }} />

              {/* Logo */}
              <div className="pt-6 px-6 flex justify-center">
                <motion.img
                  src={logoHeader}
                  alt="PilotZap"
                  className="h-9 w-auto object-contain brightness-0 invert"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                />
              </div>

              {/* Animated view content */}
              <AnimatePresence mode="wait">

                {/* ── LOGIN ─────────────────────────── */}
                {view === "login" && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 pt-4"
                  >
                    <div className="text-center mb-5">
                      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">Bem-vindo de volta</h1>
                      <p className="text-white/50 text-xs mt-1">Entre com suas credenciais para continuar</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3">
                      <div className="relative flex items-center">
                        <Mail className={`absolute left-3 w-4 h-4 transition-colors duration-300 ${loginFocused === "email" ? "text-white" : "text-white/40"}`} />
                        <GlassInput type="email" placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onFocus={() => setLoginFocused("email")} onBlur={() => setLoginFocused(null)} className="pl-10" required data-testid="input-login-email" />
                      </div>

                      <div className="relative flex items-center">
                        <Lock className={`absolute left-3 w-4 h-4 transition-colors duration-300 ${loginFocused === "password" ? "text-white" : "text-white/40"}`} />
                        <GlassInput type={showLoginPassword ? "text" : "password"} placeholder="Senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onFocus={() => setLoginFocused("password")} onBlur={() => setLoginFocused(null)} className="pl-10 pr-10" required data-testid="input-login-password" />
                        <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3" tabIndex={-1}>
                          {showLoginPassword ? <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors" /> : <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors" />}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button type="button" onClick={() => setView("forgot")} className="text-xs text-white/50 hover:text-white transition-colors duration-200">
                          Esqueci a senha
                        </button>
                      </div>

                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loginLoading} className="w-full relative group/btn mt-1" data-testid="button-login">
                        <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/btn:opacity-70 transition-opacity duration-300" />
                        <div className="relative overflow-hidden bg-white text-black font-semibold h-10 rounded-lg flex items-center justify-center text-sm">
                          <AnimatePresence mode="wait">
                            {loginLoading ? (
                              <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="w-4 h-4 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
                              </motion.div>
                            ) : (
                              <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                Entrar no PilotZap <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    </form>

                    <p className="text-center text-xs text-white/40 mt-4">
                      Não tem conta?{" "}
                      <button onClick={() => setView("register")} className="text-white/70 hover:text-white font-medium underline underline-offset-2 transition-colors">
                        Criar conta
                      </button>
                    </p>
                  </motion.div>
                )}

                {/* ── REGISTER ──────────────────────── */}
                {view === "register" && (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 pt-4"
                  >
                    <div className="text-center mb-5">
                      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">Criar conta</h1>
                      <p className="text-white/50 text-xs mt-1">Preencha seus dados para começar</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative flex items-center">
                          <User className={`absolute left-3 w-4 h-4 transition-colors duration-300 ${regFocused === "name" ? "text-white" : "text-white/40"}`} />
                          <GlassInput type="text" placeholder="Nome" value={regName} onChange={e => setRegName(e.target.value)} onFocus={() => setRegFocused("name")} onBlur={() => setRegFocused(null)} className="pl-10" required data-testid="input-reg-name" />
                        </div>
                        <div className="relative flex items-center">
                          <GlassInput type="text" placeholder="Apelido" value={regSurname} onChange={e => setRegSurname(e.target.value)} onFocus={() => setRegFocused("surname")} onBlur={() => setRegFocused(null)} className="pl-3" required data-testid="input-reg-surname" />
                        </div>
                      </div>

                      <div className="relative flex items-center">
                        <Mail className={`absolute left-3 w-4 h-4 transition-colors duration-300 ${regFocused === "email" ? "text-white" : "text-white/40"}`} />
                        <GlassInput type="email" placeholder="E-mail" value={regEmail} onChange={e => setRegEmail(e.target.value)} onFocus={() => setRegFocused("email")} onBlur={() => setRegFocused(null)} className="pl-10" required data-testid="input-reg-email" />
                      </div>

                      <div className="relative flex items-center">
                        <Lock className={`absolute left-3 w-4 h-4 transition-colors duration-300 ${regFocused === "password" ? "text-white" : "text-white/40"}`} />
                        <GlassInput type={showRegPassword ? "text" : "password"} placeholder="Senha" value={regPassword} onChange={e => { setRegPassword(e.target.value); setRegPasswordError(""); }} onFocus={() => setRegFocused("password")} onBlur={() => setRegFocused(null)} className="pl-10 pr-10" required data-testid="input-reg-password" />
                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3" tabIndex={-1}>
                          {showRegPassword ? <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors" /> : <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors" />}
                        </button>
                      </div>

                      <div className="relative flex items-center">
                        <Lock className={`absolute left-3 w-4 h-4 transition-colors duration-300 ${regFocused === "confirm" ? "text-white" : "text-white/40"}`} />
                        <GlassInput type={showRegConfirm ? "text" : "password"} placeholder="Confirmar senha" value={regConfirmPassword} onChange={e => { setRegConfirmPassword(e.target.value); setRegPasswordError(""); }} onFocus={() => setRegFocused("confirm")} onBlur={() => setRegFocused(null)} className={cn("pl-10 pr-10", regPasswordError ? "border-red-500/60 focus:border-red-500" : "")} required data-testid="input-reg-confirm" />
                        <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)} className="absolute right-3" tabIndex={-1}>
                          {showRegConfirm ? <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors" /> : <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors" />}
                        </button>
                      </div>

                      {regPasswordError && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs pl-1">
                          {regPasswordError}
                        </motion.p>
                      )}

                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={regLoading} className="w-full relative group/btn mt-1" data-testid="button-register">
                        <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/btn:opacity-70 transition-opacity duration-300" />
                        <div className="relative overflow-hidden bg-white text-black font-semibold h-10 rounded-lg flex items-center justify-center text-sm">
                          <AnimatePresence mode="wait">
                            {regLoading ? (
                              <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="w-4 h-4 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
                              </motion.div>
                            ) : (
                              <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                Criar minha conta <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    </form>

                    <p className="text-center text-xs text-white/40 mt-4">
                      Já tem conta?{" "}
                      <button onClick={() => setView("login")} className="text-white/70 hover:text-white font-medium underline underline-offset-2 transition-colors">
                        Entrar
                      </button>
                    </p>
                  </motion.div>
                )}

                {/* ── FORGOT PASSWORD ────────────────── */}
                {view === "forgot" && (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 pt-4"
                  >
                    <button onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }} className="flex items-center gap-1 text-white/50 hover:text-white text-xs transition-colors mb-4">
                      <ArrowLeft className="w-3 h-3" /> Voltar
                    </button>

                    <div className="text-center mb-5">
                      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">Esqueci a senha</h1>
                      <p className="text-white/50 text-xs mt-1">
                        {forgotSent ? "Verifique o seu e-mail!" : "Informe seu e-mail para redefinir a senha"}
                      </p>
                    </div>

                    <AnimatePresence mode="wait">
                      {forgotSent ? (
                        <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-3">
                          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto">
                            <Send className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-white/60 text-sm">Enviámos um link de recuperação para <span className="text-white font-medium">{forgotEmail}</span></p>
                          <button onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }} className="text-xs text-white/50 hover:text-white transition-colors underline underline-offset-2">
                            Voltar ao login
                          </button>
                        </motion.div>
                      ) : (
                        <motion.form key="form" onSubmit={handleForgot} className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <div className="relative flex items-center">
                            <Mail className="absolute left-3 w-4 h-4 text-white/40" />
                            <GlassInput type="email" placeholder="E-mail" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="pl-10" required data-testid="input-forgot-email" />
                          </div>

                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={forgotLoading} className="w-full relative group/btn" data-testid="button-forgot">
                            <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/btn:opacity-70 transition-opacity duration-300" />
                            <div className="relative overflow-hidden bg-white text-black font-semibold h-10 rounded-lg flex items-center justify-center text-sm">
                              <AnimatePresence mode="wait">
                                {forgotLoading ? (
                                  <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="w-4 h-4 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
                                  </motion.div>
                                ) : (
                                  <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                    Enviar link <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
