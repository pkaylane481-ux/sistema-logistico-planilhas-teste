import { processos } from "../data/mockData"

function TabelaProcessos() {

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mt-8">

      <h2 className="text-xl font-bold text-purple-950 mb-4">
        Processos Recentes
      </h2>


      <table className="w-full">

        <thead>
          <tr className="border-b">

            <th className="text-left p-2">
              Pedido
            </th>

            <th className="text-left p-2">
              Tipo
            </th>

            <th className="text-left p-2">
              Responsável
            </th>

            <th className="text-left p-2">
              SLA
            </th>

          </tr>
        </thead>


        <tbody>

          {processos.map((item) => (

            <tr 
              key={item.id}
              className="border-b"
            >

              <td className="p-2">
                {item.pedido}
              </td>

              <td className="p-2">
                {item.tipo}
              </td>

              <td className="p-2">
                {item.responsavel}
              </td>

              <td className="p-2">
                {item.sla}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}

export default TabelaProcessos