if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET no definido en variables de entorno. Usando fallback SOLO para desarrollo.");
}
export const TOKEN_SECRET = process.env.JWT_SECRET || 'fallback_dev_only';