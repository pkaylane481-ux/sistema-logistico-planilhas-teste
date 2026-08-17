import { useMemo } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

interface Props {
  devolucoesLogistica: any[];
}

const cores = [
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#0ea5e9",
  "#8b5cf6",
  "#6b7280",
  "#ec4899",
  "#14b8a6"
];

export default function MotivosChart({
  devolucoesLogistica
}: Props) {

  const dados = useMemo(() => {

    const mapa = new Map<string, number>();

    devolucoesLogistica.forEach((item) => {

      const motivo =
        item.motivo ??
        item.motivo_devolucao ??
        item.descricao ??
        "Não informado";

      mapa.set(
        motivo,
        (mapa.get(motivo) || 0) + 1
      );

    });

    return [...mapa.entries()]
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort(
        (a, b) => b.value - a.value
      );

  }, [devolucoesLogistica]);

  return (

    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-bold text-gray-800">
            Motivos das Devoluções Logísticas
          </h2>

          <p className="text-sm text-gray-500">
            Distribuição por motivo registrado
          </p>

        </div>

        <span className="text-sm text-gray-500">
          {devolucoesLogistica.length} registros
        </span>

      </div>

      {
        dados.length === 0 ? (

          <div className="h-[320px] flex items-center justify-center text-gray-500">

            Nenhuma devolução logística encontrada.

          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={dados}
                dataKey="value"
                nameKey="name"
                outerRadius={105}
                label
              >

                {dados.map((_, index) => (

                  <Cell
                    key={index}
                    fill={cores[index % cores.length]}
                  />

                ))}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        )
      }

    </div>

  );

}