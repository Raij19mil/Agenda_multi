// Ferramenta para decodificar o JWT salvo no localStorage e exibir os dados no console
// Basta importar e chamar a função decodeJwtToken() no console do navegador

export function decodeJwtToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Nenhum token JWT encontrado no localStorage.');
    return;
  }
  const payload = token.split('.')[1];
  if (!payload) {
    console.warn('Token JWT malformado.');
    return;
  }
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    console.log('Payload JWT decodificado:', decoded);
    return decoded;
  } catch (e) {
    console.error('Erro ao decodificar JWT:', e);
  }
}
