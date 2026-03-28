/**
 * URL base da API do backend.
 * Celular na mesma rede Wi‑Fi: use o IP do PC (ex: 192.168.1.8).
 * Emulador Android: use 10.0.2.2
 */
export const API_BASE_URL = 'https://monitorchuva.onrender.com';

// Use o IP do seu PC (na mesma rede Wi-Fi). No Expo, costuma aparecer como exp://<IP>:8081.
// Ajuste a porta para a que o backend realmente está usando (no projeto: backend/.env -> PORT=3000).
//export const API_BASE_URL = 'http://192.168.18.4:3000';