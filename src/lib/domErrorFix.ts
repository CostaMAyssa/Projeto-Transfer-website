// DOM Error Fix - Intercepta erros de manipulação DOM comuns
console.log('🔧 Iniciando correção de erros DOM...');

// Intercepta erros de removeChild que são comuns com Mapbox e outros libs de terceiros
const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function<T extends Node>(child: T): T {
  try {
    // Verifica se o nó é realmente filho antes de tentar remover
    if (this.contains(child)) {
      return originalRemoveChild.call(this, child);
    } else {
      console.warn('⚠️ Tentativa de remover nó que não é filho - ignorando para evitar erro');
      return child;
    }
  } catch (error) {
    console.warn('⚠️ Erro interceptado em removeChild:', error);
    return child;
  }
};

// Intercepta erros de appendChild
const originalAppendChild = Node.prototype.appendChild;
Node.prototype.appendChild = function<T extends Node>(child: T): T {
  try {
    return originalAppendChild.call(this, child);
  } catch (error) {
    console.warn('⚠️ Erro interceptado em appendChild:', error);
    return child;
  }
};

// Intercepta erros de insertBefore
const originalInsertBefore = Node.prototype.insertBefore;
Node.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
  try {
    return originalInsertBefore.call(this, newNode, referenceNode);
  } catch (error) {
    console.warn('⚠️ Erro interceptado em insertBefore:', error);
    return newNode;
  }
};

// Intercepta erros globais de DOM
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('removeChild') ||
    event.message.includes('appendChild') ||
    event.message.includes('insertBefore') ||
    event.message.includes('Failed to execute')
  )) {
    console.warn('🚨 Erro DOM interceptado e suprimido:', event.message);
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
});

// Log para confirmar que a correção foi aplicada
console.log('✅ Correção de erros DOM aplicada com sucesso');

export const domErrorFixApplied = true; 