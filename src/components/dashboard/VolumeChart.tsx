import { useMemo } from "react";
import { useSistema } from "../../context/SistemaContext";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from "recharts";

export default function VolumeChart() {

  const {
    trocas,
    devolucoesLogistica,
    prioridades,
    falhas
  } = useSistema();

  const dados = useMemo(() => [

    {
      nome: "Trocas",
      quantidade: trocas.length
    },

    {
      nome: "Devoluções",
      quantidade: devolucoesLogistica.length
    },

    {
      nome: "Prioridades",
      quantidade: prioridades.length
    },

    {
      nome: "Falhas",
      quantidade: falhas.length
    }

  ], [
    trocas,
    devolucoesLogistica,
    prioridades,
    falhas
  ]);

  return (

    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-lg font-bold mb-4">
        Volume Operacional
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >

        <BarChart data={dados}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="nome" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="quantidade"
            radius={[8,8,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}