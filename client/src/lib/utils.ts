import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  if (!date) return '';
  return `${formatDate(date)} ${formatTime(date)}`;
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getRandomResponse = (question: string): string => {
  if (question.toLowerCase().includes('matrícula') || question.toLowerCase().includes('matricula')) {
    return 'Para iniciar sua matrícula, precisamos preencher um formulário com seus dados pessoais. Posso te ajudar com isso agora?';
  }
  
  if (question.toLowerCase().includes('curso') || question.toLowerCase().includes('cursos')) {
    return 'Temos diversos cursos disponíveis como Administração, Engenharia, Medicina, Direito e Ciência da Computação. Qual deles te interessa?';
  }
  
  if (question.toLowerCase().includes('documento') || question.toLowerCase().includes('documentos')) {
    return 'Para a matrícula, você precisará apresentar RG, CPF, comprovante de residência, certificado de conclusão do ensino médio e uma foto 3x4 recente.';
  }
  
  if (question.toLowerCase().includes('prazo') || question.toLowerCase().includes('data') || question.toLowerCase().includes('quando')) {
    return 'As matrículas estão abertas até o final do mês. Recomendo não deixar para a última hora para evitar imprevistos.';
  }
  
  if (question.toLowerCase().includes('preço') || question.toLowerCase().includes('preco') || question.toLowerCase().includes('valor') || question.toLowerCase().includes('custo')) {
    return 'Os valores dos cursos variam conforme a modalidade e turno escolhidos. Durante o processo de matrícula, você terá acesso às opções de pagamento e descontos disponíveis.';
  }
  
  if (question.toLowerCase().includes('bolsa') || question.toLowerCase().includes('financiamento')) {
    return 'Sim, oferecemos bolsas de estudo e opções de financiamento. Você pode solicitar mais informações durante o processo de matrícula ou com nosso setor financeiro.';
  }
  
  if (question.toLowerCase().includes('ajuda') || question.toLowerCase().includes('dúvida') || question.toLowerCase().includes('duvida')) {
    return 'Estou aqui para ajudar com todo o processo de matrícula. Se tiver dúvidas específicas, é só perguntar!';
  }
  
  return 'Entendi! Posso ajudar com qualquer dúvida sobre o processo de matrícula. Se quiser iniciar uma nova matrícula, é só me avisar.';
};

export function createFileFromBase64(base64String: string, fileName: string, mimeType: string): File {
  const byteCharacters = atob(base64String.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export function openWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
}
