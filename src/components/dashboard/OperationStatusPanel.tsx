import { useMemo } from "react";

interface Props {
  trocas: any[];
  devolucoesLogistica: any[];
  devolucaoMarketplace: any[];
  prioridades: any[];
  falhas: any[];
  slas: any[];
}

export default function OperationStatusPanel({
  trocas,
  devolucoesLogistica,
  devolucaoMarketplace,
  prioridades,
  falhas,
  slas
}: Props) {

  const indicadores = useMemo(() => {

    const troquecommerce = trocas.filter(
      item => item.status !== "Finalizado"
    ).length;

    const devolucoes = devolucoesLogistica.filter(
      item => item.status !== "Finalizado"
    ).length;

    const marketplace = devolucaoMarketplace.filter(
      item => item.status !== "Finalizado"
    ).length;

    const prioridade = prioridades.filter(
      item =>
        item.status !== "Finalizado" &&
        item.status !== "Resolvido"
    ).length;

    const falhasPecas = falhas.filter(
      item =>
        item.status !== "Finalizado" &&
        item.status !== "Resolvido"
    ).length;

    const slaAtrasado = slas.filter(
      item => item.status === "Fora do SLA"
    ).length;

    const total =
      troquecommerce +
      devolucoes +
      marketplace +
      prioridade +
      falhasPecas;

    return {
      troquecommerce,
      devolucoes,
      marketplace,
      prioridade,
      falhasPecas,
      slaAtrasado,
      total
    };

  }, [
    trocas,
    devolucoesLogistica,
    devolucaoMarketplace,
    prioridades,
    falhas,
    slas
  ]);

  return (

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            Status da Operação
          </h2>

          <p className="text-sm text-gray-500">
            Processos em andamento
          </p>

        </div>

        <div className="text-right">

          <p className="text-sm text-gray-500">
            Total
          </p>

          <h3 className="text-3xl font-bold text-purple-700">
            {indicadores.total}
          </h3>

        </div>

      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">

        <StatusCard
          titulo="Trocas e Devoluções (Troquecommerce)"
          valor={indicadores.troquecommerce}
          cor="purple"
        />

        <StatusCard
          titulo="Devoluções Logísticas"
          valor={indicadores.devolucoes}
          cor="blue"
        />

        <StatusCard
          titulo="Devoluções Marketplace"
          valor={indicadores.marketplace}
          cor="cyan"
        />

        <StatusCard
          titulo="Pedidos Prioridade"
          valor={indicadores.prioridade}
          cor="amber"
        />

        <StatusCard
          titulo="Falhas Operacionais"
          valor={indicadores.falhasPecas}
          cor="red"
        />

        <StatusCard
          titulo="SLA Fora do Prazo"
          valor={indicadores.slaAtrasado}
          cor="indigo"
        />

      </div>

    </div>

  );

}

interface StatusCardProps {
  titulo: string;
  valor: number;
  cor:
    | "purple"
    | "blue"
    | "cyan"
    | "amber"
    | "red"
    | "indigo";
}

function StatusCard({
  titulo,
  valor,
  cor
}: StatusCardProps) {

  const cores = {

    purple: "bg-purple-50 border-purple-200 text-purple-700",

    blue: "bg-blue-50 border-blue-200 text-blue-700",

    cyan: "bg-cyan-50 border-cyan-200 text-cyan-700",

    amber: "bg-amber-50 border-amber-200 text-amber-700",

    red: "bg-red-50 border-red-200 text-red-700",

    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700"

  };

  return (

    <div className={`rounded-xl border p-5 ${cores[cor]}`}>

      <p className="text-sm font-medium opacity-80 leading-tight">
        {titulo}
      </p>

      <h3 className="text-3xl font-bold mt-3">
        {valor}
      </h3>

    </div>

  );

}