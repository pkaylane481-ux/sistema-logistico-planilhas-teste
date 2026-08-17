import { reenvios } from "../data/reenvios"


function ResumoReenvios(){

  const total = reenvios.length


  const pendentes = reenvios.filter(
    item => item.status === "Em separação"
  ).length


  const transporte = reenvios.filter(
    item => item.status === "Em transporte"
  ).length


  const finalizados = reenvios.filter(
    item => item.status === "Finalizado"
  ).length



  return (

    <div className="grid grid-cols-4 gap-6 mb-8">


      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Total Reenvios
        </p>

        <h2 className="text-3xl font-bold text-purple-950">
          {total}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Pendentes
        </p>

        <h2 className="text-3xl font-bold text-yellow-600">
          {pendentes}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Em Transporte
        </p>

        <h2 className="text-3xl font-bold text-blue-600">
          {transporte}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Finalizados
        </p>

        <h2 className="text-3xl font-bold text-green-600">
          {finalizados}
        </h2>

      </div>


    </div>

  )

}


export default ResumoReenvios