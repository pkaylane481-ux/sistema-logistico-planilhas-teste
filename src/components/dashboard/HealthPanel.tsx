import { useMemo } from "react";

interface Props {
  trocas: any[];
  devolucoesLogistica: any[];
  devolucaoMarketplace: any[];
  prioridades: any[];
  falhas: any[];
  slas: any[];
}

export default function HealthPanel({
  trocas,
  devolucoesLogistica,
  devolucaoMarketplace,
  prioridades,
  falhas,
  slas
}: Props) {

  const indicadores = useMemo(() => {

    const totalTroquecommerce = trocas.length;

    const totalDevolucoesLogistica =
      devolucoesLogistica.length;

    const totalMarketplace =
      devolucaoMarketplace.length;

    const totalPrioridades =
      prioridades.length;

    const totalFalhas =
      falhas.length;

    const foraSLA =
      slas.filter(
        item => item.status === "Fora do SLA"
      ).length;

    const totalProcessos =
      totalTroquecommerce +
      totalDevolucoesLogistica +
      totalMarketplace +
      totalPrioridades +
      totalFalhas;

    let status = "Operação Saudável";
    let cor = "bg-green-500";

    if (foraSLA >= 10) {
      status = "Operação Crítica";
      cor = "bg-red-500";
    } else if (foraSLA >= 5) {
      status = "Operação em Atenção";
      cor = "bg-yellow-500";
    }

    return {
      totalTroquecommerce,
      totalDevolucoesLogistica,
      totalMarketplace,
      totalPrioridades,
      totalFalhas,
      totalProcessos,
      foraSLA,
      status,
      cor
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

    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Saúde Operacional
      </h2>

      <div className="space-y-5">

        <Linha
          titulo="Trocas e Devoluções (Troquecommerce)"
          valor={indicadores.totalTroquecommerce}
          cor="text-purple-700"
        />

        <Linha
          titulo="Devoluções Logísticas"
          valor={indicadores.totalDevolucoesLogistica}
          cor="text-blue-700"
        />

        <Linha
          titulo="Devoluções Marketplace"
          valor={indicadores.totalMarketplace}
          cor="text-cyan-700"
        />

        <Linha
          titulo="Pedidos Prioridade"
          valor={indicadores.totalPrioridades}
          cor="text-amber-700"
        />

        <Linha
          titulo="Falhas Operacionais"
          valor={indicadores.totalFalhas}
          cor="text-red-700"
        />

        <Linha
          titulo="Processos Totais"
          valor={indicadores.totalProcessos}
          cor="text-indigo-700"
        />

        <div className="border-t pt-5">

          <div className="flex justify-between items-center">

            <span className="font-medium text-gray-700">
              Status Geral
            </span>

            <div className="flex items-center gap-2">

              <div
                className={`w-3 h-3 rounded-full ${indicadores.cor}`}
              />

              <span className="font-semibold text-gray-800">
                {indicadores.status}
              </span>

            </div>

          </div>

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

    <div className="flex justify-between items-center border-b pb-3">

      <span className="text-gray-600">
        {titulo}
      </span>

      <span className={`font-bold text-xl ${cor}`}>
        {valor}
      </span>

    </div>

  );

}