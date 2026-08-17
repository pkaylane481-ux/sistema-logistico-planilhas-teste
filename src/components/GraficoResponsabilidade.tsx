import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

import { causasProblemas } from "../data/indicadores"


function GraficoResponsabilidade() {

  return (

    <div className="bg-white rounded-xl shadow-md p-6 mt-8">


      <h2 className="text-xl font-bold text-purple-950 mb-5">
        Responsabilidade pelos Problemas
      </h2>


      <ResponsiveContainer 
        width="100%" 
        height={300}
      >

        <BarChart data={causasProblemas}>


          <XAxis 
            dataKey="causa"
          />


          <YAxis />


          <Tooltip />


          <Bar 
            dataKey="quantidade"
            fill="#4c1d95"
          />


        </BarChart>


      </ResponsiveContainer>


    </div>

  )

}


export default GraficoResponsabilidade