import { useMemo } from "react";

interface Props {
  trocas: any[];
  devolucoesLogistica: any[];
  devolucaoMarketplace: any[];
  prioridades: any[];
  falhas: any[];
}

export default function ProductivityPanel({
  trocas,
  devolucoesLogistica,
  devolucaoMarketplace,
  prioridades,
  falhas,
}: Props) {

  const indicadores = useMemo(() => {

    const processos = [

      ...trocas,

      ...devolucoesLogistica,

      ...devolucaoMarketplace,

      ...prioridades,

      ...falhas

    ];

    const total = processos.length;

    const concluidos = processos.filter(item => {

      const status = String(item.status ?? "").toLowerCase();

      return (
        status.includes("concl") ||
        status.includes("final")
      );

    }).length;

    const pendentes = total - concluidos;

    const percentual =
      total === 0
        ? 0
        : Math.round((concluidos / total) * 100);

    return {

      total,

      concluidos,

      pendentes,

      percentual

    };

  }, [

    trocas,

    devolucoesLogistica,

    devolucaoMarketplace,

    prioridades,

    falhas

  ]);

  return (

    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-bold text-gray-800">

            Acompanhamento da Operação

          </h2>

          <p className="text-sm text-gray-500">

            Evolução dos processos do período

          </p>

        </div>

        <div className="text-right">

          <p className="text-xs text-gray-500">

            Conclusão

          </p>

          <p className="text-3xl font-bold text-purple-700">

            {indicadores.percentual}%

          </p>

        </div>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-8">

        <div
          className="bg-purple-600 h-4 transition-all duration-700"
          style={{
            width: `${indicadores.percentual}%`
          }}
        />

      </div>

      <div className="grid grid-cols-3 gap-6">

        <div className="text-center">

          <p className="text-sm text-gray-500">

            Total

          </p>

          <h3 className="text-4xl font-bold text-gray-800">

            {indicadores.total}

          </h3>

        </div>

        <div className="text-center">

          <p className="text-sm text-gray-500">

            Concluídos

          </p>

          <h3 className="text-4xl font-bold text-green-600">

            {indicadores.concluidos}

          </h3>

        </div>

        <div className="text-center">

          <p className="text-sm text-gray-500">

            Pendentes

          </p>

          <h3 className="text-4xl font-bold text-red-600">

            {indicadores.pendentes}

          </h3>

        </div>

      </div>

    </div>

  );

}