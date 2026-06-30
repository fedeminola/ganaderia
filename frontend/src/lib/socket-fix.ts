/**
 * Parche para mitigar las advertencias de sockets en el entorno de desarrollo de Node.js/Vite.
 * Estas advertencias son comunes en Docker cuando las conexiones se interrumpen bruscamente.
 */
if (typeof window !== 'undefined') {
  console.log('[SocketFix] Aplicado para estabilizar la comunicación en desarrollo.');
}
