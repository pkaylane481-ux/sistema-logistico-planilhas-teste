import { useMemo } from "react";

interface Props {
  trocas: any[];
  devolucoesLogistica: any[];
  devolucaoMarketplace: any[];
  prioridades: any[];
  falhas: any[];
  slas: any[];
}

export default function BottleneckPanel({
  trocas,
  devolucoesLogistica,
  devolucaoMarketplace,
  prioridades,
  falhas,
  slas
}: Props) {

  const indicadores = useMemo(() => {

    const slaAtrasado =
      slas.filter(
        item => item.status === "Fora do SLA"
      ).length;

    const troquecommerce =
      trocas.filter(
        item =>
          item.status !== "Finalizado" &&
          item.status !== "Concluído"
      ).length;

    const devolucoes =
      devolucoesLogistica.filter(
        item =>
          item.status !== "Finalizado" &&
          item.status !== "Concluído"
      ).length;

    const marketplace =
      devolucaoMarketplace.filter(
        item =>
          item.status !== "Finalizado" &&
          item.status !== "Concluído"
      ).length;

    const prioridadesPendentes =
      prioridades.filter(
        item =>
          item.status !== "Finalizado" &&
          item.status !== "Resolvido"
      ).length;

    const falhasPendentes =
      falhas.filter(
        item =>
          item.status !== "Finalizado" &&
          item.status !== "Resolvido"
      ).length;

    const totalCritico =
      slaAtrasado +
      prioridadesPendentes +
      falhasPendentes;

    return {
      slaAtrasado,
      troquecommerce,
      devolucoes,
      marketplace,
      prioridadesPendentes,
      falhasPendentes,
      totalCritico
    };

  }, [
    trocas,
    devolucoesLogistica,
    devolucaoMarketplace,
    prioridades,
    falhas,
    slas
  ]);

  const nivel =
    indicadores.totalCritico >= 20
      ? {
          texto: "CRÍTICO",
          cor: "text-red-600 bg-red-100 border-red-300"
        }
      : indicadores.totalCritico >= 10
      ? {
          texto: "ATENÇÃO",
          cor: "text-yellow-700 bg-yellow-100 border-yellow-300"
        }
      : {
          texto: "CONTROLADO",
          cor: "text-green-700 bg-green-100 border-green-300"
        };

  return (

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            Gargalos da Operação
          </h2>

          <p className="text-sm text-gray-500">
            Indicadores que exigem atenção
          </p>

        </div>

        <span
          className={`px-4 py-2 rounded-full border font-semibold ${nivel.cor}`}
        >
          {nivel.texto}
        </span>

      </div>

      <div className="space-y-4">

        <Linha
          titulo="SLA Fora do Prazo"
          valor={indicadores.slaAtrasado}
          cor="bg-red-500"
        />

        <Linha
          titulo="Pedidos Prioridade"
          valor={indicadores.prioridadesPendentes}
          cor="bg-orange-500"
        />

        <Linha
          titulo="Falhas Operacionais"
          valor={indicadores.falhasPendentes}
          cor="bg-yellow-500"
        />

        <Linha
          titulo="Trocas e Devoluções (Troquecommerce)"
          valor={indicadores.troquecommerce}
          cor="bg-purple-500"
        />

        <Linha
          titulo="Devoluções Logísticas"
          valor={indicadores.devolucoes}
          cor="bg-blue-500"
        />

        <Linha
          titulo="Devoluções Marketplace"
          valor={indicadores.marketplace}
          cor="bg-cyan-500"
        />

      </div>

      <div className="mt-8 border-t pt-6 flex justify-between items-center">

        <div>

          <p className="text-sm text-gray-500">
            Índice Geral de Criticidade
          </p>

          <h3 className="text-4xl font-bold text-red-600">
            {indicadores.totalCritico}
          </h3>

        </div>

        <div className="text-right">

          <p className="text-sm text-gray-500">
            Quanto menor, melhor
          </p>

          <p className="text-xs text-gray-400">
            Baseado em SLA, prioridades e falhas
          </p>

        </div>

      </div>

    </div>

  );

}

interface LinhaProps {
  titulo: string;
  valor: number;
  cor: string;
}

function Linha({
  titulo,
  valor,
  cor
}: LinhaProps) {

  return (

    <div className="flex justify-between items-center">

      <div className="flex items-center gap-3">

        <div className={`w-3 h-3 rounded-full ${cor}`} />

        <span className="text-gray-700">
          {titulo}
        </span>

      </div>

      <span className="text-xl font-bold text-gray-800">
        {valor}
      </span>

    </div>

  );

}