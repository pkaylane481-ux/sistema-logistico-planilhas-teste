export const devolucoes = [

  {
    id: 1,
    pedido: "10280",
    dataRecebimento: "2026-07-09",
    transportadora: "Correios",
    motivo: "Cliente recusou recebimento",
    responsavel: "Transportadora",
    tentativasContato: 0,
    status: "Aguardando análise",
    destino: "Estorno",
    sla: 4
  },


  {
    id: 2,
    pedido: "10325",
    dataRecebimento: "2026-07-05",
    transportadora: "Jadlog",
    motivo: "Avaria no transporte",
    responsavel: "Interno",
    tentativasContato: 1,
    status: "Recebido",
    destino: "Qualidade",
    sla: 4
  },


  {
    id: 3,
    pedido: "10340",
    dataRecebimento: "2026-07-07",
    transportadora: "Loggi",
    motivo: "Insucesso de entrega",
    responsavel: "Cliente",
    tentativasContato: 3,
    status: "Contato realizado",
    destino: "Reenvio",
    sla: 4
  }

]