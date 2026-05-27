export function validateEmail(email) {
  if (!email?.trim()) return "Email obrigatório";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Email inválido";
  return null;
}

export function validatePassword(password) {
  if (!password) return "Senha obrigatória";
  if (password.length < 8) return "Mínimo 8 caracteres";
  if (!/[a-zA-Z]/.test(password)) return "Deve conter pelo menos uma letra";
  if (!/[0-9]/.test(password)) return "Deve conter pelo menos um número";
  return null;
}

export function validatePasswordConfirm(password, confirm) {
  if (!confirm) return "Confirme sua senha";
  if (password !== confirm) return "As senhas não coincidem";
  return null;
}

export function validateDisplayName(name) {
  if (!name?.trim()) return "Nome obrigatório";
  if (name.trim().length < 2) return "Nome muito curto";
  if (name.trim().length > 50) return "Nome muito longo";
  return null;
}

export function translateAuthError(error) {
  if (!error) return null;
  const msg = error.message?.toLowerCase() ?? "";

  if (msg.includes("invalid login credentials")) return "Email ou senha incorretos";
  if (msg.includes("email not confirmed")) return "Confirme seu email antes de entrar";
  if (msg.includes("user already registered")) return "Este email já está cadastrado";
  if (msg.includes("password should be at least")) return "Senha muito fraca";
  if (msg.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos";
  if (msg.includes("network")) return "Erro de conexão. Verifique sua internet";
  if (msg.includes("email address is invalid")) return "Email inválido";

  return "Ocorreu um erro. Tente novamente";
}
