import { devolucoesLogisticas } from "../data/devolucaoLogistica"


function calcularDias(data: string) {

  const inicio = new Date(data)

  const hoje = new Date()

  const diferenca =
    hoje.getTime() - inicio.getTime()


  return Math.floor(
    diferenca / (1000 * 60 * 60 * 24)
  )

}



function ResumoDevolucaoLogistica() {


  const total =
    devolucoesLogisticas.length



  const emContato =
    devolucoesLogisticas.filter(
      item => item.status === "Em contato"
    ).length



  const reenvios =
    devolucoesLogisticas.filter(
      item => item.status === "Reenvio Gerado"
    ).length



  const estoque =
    devolucoesLogisticas.filter(
      item => item.status === "Estoque"
    ).length



  const atrasadas =
    devolucoesLogisticas.filter(

      item =>
        calcularDias(item.dataAbertura) > 9
        &&
        ![
          "Reenvio Gerado",
          "Estoque",
          "Cancelado"
        ].includes(item.status)

    ).length



  return (

    <div className="grid grid-cols-5 gap-5 mb-8">


      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500">
          Total
        </p>

        <h2 className="text-3xl font-bold text-purple-950">
          {total}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500">
          Em contato
        </p>

        <h2 className="text-3xl font-bold text-blue-600">
          {emContato}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500">
          Reenvios
        </p>

        <h2 className="text-3xl font-bold text-green-600">
          {reenvios}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500">
          Estoque
        </p>

        <h2 className="text-3xl font-bold text-orange-600">
          {estoque}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500">
          SLA Atrasado
        </p>

        <h2 className="text-3xl font-bold text-red-600">
          {atrasadas}
        </h2>

      </div>


    </div>

  )

}


export default ResumoDevolucaoLogistica