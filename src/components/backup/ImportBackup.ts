export function importarBackup(
  arquivo: File,
  onSuccess?: () => void,
  onError?: (mensagem: string) => void
) {

  const leitor = new FileReader();

  leitor.onload = (evento) => {

    try {

      const texto = evento.target?.result as string;

      const backup = JSON.parse(texto);

      if (!backup.dados) {

        throw new Error("Arquivo inválido.");

      }

      // Limpa somente dados do sistema
      Object.keys(localStorage).forEach((chave) => {

        if (chave.startsWith("sistema_")) {

          localStorage.removeItem(chave);

        }

      });

      // Restaura os dados
      Object.entries(backup.dados).forEach(([chave, valor]) => {

        if (typeof valor === "string") {

          localStorage.setItem(chave, valor);

        }

      });

      onSuccess?.();

    } catch {

      onError?.("O arquivo selecionado não é um backup válido.");

    }

  };

  leitor.readAsText(arquivo);

}