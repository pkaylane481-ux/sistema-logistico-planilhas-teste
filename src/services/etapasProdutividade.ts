import { criarProdutividade } from "./produtividade";

type EtapaProdutividade = {
  operador: string;
  atividade: string;
  processo: string;
  pedido?: string;
  registroId?: string;
  observacao?: string;
  data?: string;
  quantidade?: number;
};

function hoje(): string {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export async function registrarEtapaProdutividade(
  etapa: EtapaProdutividade
): Promise<boolean> {
  const referencias = [
    `Processo: ${etapa.processo}`,
    etapa.pedido ? `Pedido: ${etapa.pedido}` : "",
    etapa.registroId ? `Registro: ${etapa.registroId}` : "",
    etapa.observacao ?? ""
  ].filter(Boolean);

  const resultado = await criarProdutividade({
    operador: etapa.operador.trim(),
    atividade: etapa.atividade,
    quantidade: etapa.quantidade ?? 1,
    sla: "Automático",
    status: "Finalizado",
    observacao: referencias.join(" | "),
    data: etapa.data || hoje()
  });

  return Boolean(resultado);
}
