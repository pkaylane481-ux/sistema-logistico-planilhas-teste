import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

import { impactoFinanceiro } from "../data/indicadores"


function GraficoFinanceiro(){

  return (

    <div className="bg-white rounded-xl shadow-md p-6 mt-8">


      <h2 className="text-xl font-bold text-purple-950 mb-5">
        Impacto Financeiro
      </h2>


      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <BarChart data={impactoFinanceiro}>


          <XAxis
            dataKey="categoria"
          />


          <YAxis />


          <Tooltip />


          <Bar
            dataKey="valor"
            fill="#581c87"
          />


        </BarChart>


      </ResponsiveContainer>


    </div>

  )

}


export default GraficoFinanceiro