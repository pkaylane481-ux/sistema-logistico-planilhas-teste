import { devolucoes } from "../data/devolucoes"


function ResumoDevolucoes(){

  const total = devolucoes.length


  const aguardando = devolucoes.filter(
    item => item.status === "Aguardando análise"
  ).length


  const contato = devolucoes.filter(
    item => item.status === "Contato realizado"
  ).length


  const finalizadas = devolucoes.filter(
    item => item.status === "Finalizado"
  ).length



  return (

    <div className="grid grid-cols-4 gap-6 mb-8">


      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Total Devoluções
        </p>

        <h2 className="text-3xl font-bold text-purple-950">
          {total}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Aguardando Análise
        </p>

        <h2 className="text-3xl font-bold text-yellow-600">
          {aguardando}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Em Contato
        </p>

        <h2 className="text-3xl font-bold text-blue-600">
          {contato}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Finalizadas
        </p>

        <h2 className="text-3xl font-bold text-green-600">
          {finalizadas}
        </h2>

      </div>


    </div>

  )

}


export default ResumoDevolucoes