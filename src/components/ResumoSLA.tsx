import { processosSLA } from "../data/processos"


function ResumoSLA(){

  const total = processosSLA.length


  const atrasados = processosSLA.filter((item)=>{

    const inicio = new Date(item.dataInicio)

    const vencimento = new Date(inicio)

    vencimento.setDate(
      vencimento.getDate() + item.prazo
    )

    return vencimento < new Date()

  }).length



  const dentroPrazo = total - atrasados


  const percentual = Math.round(
    (dentroPrazo / total) * 100
  )


  return (

    <div className="grid grid-cols-4 gap-6 mt-8">


      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Total Processos
        </p>

        <h2 className="text-3xl font-bold text-purple-950">
          {total}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Dentro do SLA
        </p>

        <h2 className="text-3xl font-bold text-green-600">
          {dentroPrazo}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Atrasados
        </p>

        <h2 className="text-3xl font-bold text-red-600">
          {atrasados}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Cumprimento SLA
        </p>

        <h2 className="text-3xl font-bold text-purple-700">
          {percentual}%
        </h2>

      </div>


    </div>

  )

}


export default ResumoSLA