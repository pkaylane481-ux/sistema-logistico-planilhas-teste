import { produtividade } from "../data/produtividade"


function ResumoProdutividade() {


  const totalRealizado = produtividade.reduce(
    (total, item) => total + item.quantidade,
    0
  )


  const mediaMeta = Math.round(

    produtividade.reduce(
      (total, item) => 
        total + ((item.quantidade / item.meta) * 100),
      0
    )
    /
    produtividade.length

  )


  const acimaMeta = produtividade.filter(
    item => item.quantidade >= item.meta
  ).length


  const abaixoMeta = produtividade.filter(
    item => item.quantidade < item.meta
  ).length



  return (

    <div className="grid grid-cols-4 gap-6 mb-8">


      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Total Realizado
        </p>

        <h2 className="text-3xl font-bold text-purple-950">
          {totalRealizado}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Média Meta
        </p>

        <h2 className="text-3xl font-bold text-blue-600">
          {mediaMeta}%
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Acima da Meta
        </p>

        <h2 className="text-3xl font-bold text-green-600">
          {acimaMeta}
        </h2>

      </div>



      <div className="bg-white rounded-xl shadow-md p-5">

        <p className="text-gray-500">
          Abaixo da Meta
        </p>

        <h2 className="text-3xl font-bold text-red-600">
          {abaixoMeta}
        </h2>

      </div>


    </div>

  )

}


export default ResumoProdutividade