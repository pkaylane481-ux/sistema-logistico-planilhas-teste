import { useMemo } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

interface Props {
  produtividade: any[];
}

export default function ProductivityChart({
  produtividade
}: Props) {

  const { dados, operadores } = useMemo(() => {

    const mapa = new Map<string, any>();
    const listaOperadores = new Set<string>();

    produtividade.forEach((item) => {

      const dataBruta =
        item.data ??
        item.data_entrada ??
        item.created_at;

      if (!dataBruta) return;

      const data = new Date(dataBruta)
        .toLocaleDateString("pt-BR");

      const operador =
        item.operador ??
        item.responsavel ??
        item.responsavel_nome ??
        "Não informado";

      listaOperadores.add(operador);

      if (!mapa.has(data)) {
        mapa.set(data, { data });
      }

      const registro = mapa.get(data);

      registro[operador] =
        (registro[operador] || 0) +
        Number(item.quantidade ?? 0);

    });

    return {
  dados: [...mapa.values()].sort((a,b)=>{

    return new Date(
      a.data.split("/").reverse().join("-")
    ).getTime()

    -

    new Date(
      b.data.split("/").reverse().join("-")
    ).getTime();

  }),

  operadores: [...listaOperadores]
};

  }, [produtividade]);

  return (

    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Evolução da Produtividade por Operador
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Comparação diária da produtividade entre operadores
      </p>

      {dados.length === 0 ? (

        <p className="text-gray-500">
          Nenhuma produtividade registrada para o período selecionado.
        </p>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={420}
        >

          <LineChart data={dados}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="data" />

            <YAxis />

            <Tooltip />

            <Legend />

            {operadores.map((operador, index) => (

              <Line
                key={operador}
                type="monotone"
                dataKey={operador}
                stroke={[
                  "#7c3aed",
                  "#2563eb",
                  "#16a34a",
                  "#ea580c",
                  "#dc2626",
                  "#0891b2",
                  "#9333ea",
                  "#ca8a04",
                  "#4f46e5",
                  "#059669"
                ][index % 10]}
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                connectNulls
              />

            ))}

          </LineChart>

        </ResponsiveContainer>

      )}

    </div>

  );

}