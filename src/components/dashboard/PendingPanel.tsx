interface Props {
  trocas: any[];
  devolucoesLogistica: any[];
  prioridades: any[];
  slas: any[];
}

export default function PendingPanel({
  trocas,
  devolucoesLogistica,
  prioridades,
  slas,
}: Props) {
  const trocasPendentes = trocas.filter(
    (item) =>
      item.status !== "Finalizado" &&
      item.status !== "Concluído"
  ).length;

  const devolucoesPendentes = devolucoesLogistica.filter(
    (item) =>
      item.status !== "Finalizado" &&
      item.status !== "Concluído"
  ).length;

  const prioridadesPendentes = prioridades.filter(
    (item) =>
      item.status !== "Resolvido" &&
      item.status !== "Concluído"
  ).length;

  const slaVencido = slas.filter(
    (item) => item.status === "Fora do SLA"
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Pendências Operacionais
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between items-center bg-purple-50 rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600">
              Trocas e Devoluções
            </p>

            <p className="text-2xl font-bold text-purple-700">
              {trocasPendentes}
            </p>
          </div>

          <span className="text-2xl">
            🔄
          </span>
        </div>

        <div className="flex justify-between items-center bg-blue-50 rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600">
              Devoluções Logísticas
            </p>

            <p className="text-2xl font-bold text-blue-700">
              {devolucoesPendentes}
            </p>
          </div>

          <span className="text-2xl">
            📦
          </span>
        </div>

        <div className="flex justify-between items-center bg-yellow-50 rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600">
              Pedidos Prioridade
            </p>

            <p className="text-2xl font-bold text-yellow-700">
              {prioridadesPendentes}
            </p>
          </div>

          <span className="text-2xl">
            ⭐
          </span>
        </div>

        <div className="flex justify-between items-center bg-red-50 rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600">
              SLA Fora do Prazo
            </p>

            <p className="text-2xl font-bold text-red-700">
              {slaVencido}
            </p>
          </div>

          <span className="text-2xl">
            ⚠️
          </span>
        </div>

      </div>

    </div>
  );
}