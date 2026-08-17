import { useMemo } from "react";

interface Props {
  devolucoesLogistica: any[];
}

export default function ResultadoDevolucao({
  devolucoesLogistica
}: Props) {


  const resultado = useMemo(() => {

    const reenviados =
      devolucoesLogistica.filter(
        item =>
          item.status === "Enviado" ||
          item.status === "Finalizado"
      ).length;


    const estornados =
      devolucoesLogistica.filter(
        item =>
          item.status === "Estoque"
      ).length;


    const emTratativa =
      devolucoesLogistica.filter(
        item =>
          [
            "Em andamento",
            "Pendente",
            "Recebido",
            "Em contato",
            "Reenviar"
          ].includes(item.status)
      ).length;


    return {
      reenviados,
      estornados,
      emTratativa
    };


  }, [devolucoesLogistica]);



  return (

    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-gray-800 mb-5">
        Resultado das Devoluções
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


        <Card
          titulo="🔁 Reenviado"
          valor={resultado.reenviados}
        />


        <Card
          titulo="💰 Estornado"
          valor={resultado.estornados}
        />


        <Card
          titulo="⏳ Em Tratativa"
          valor={resultado.emTratativa}
        />


      </div>


    </div>

  );

}



function Card({
  titulo,
  valor
}: {
  titulo:string;
  valor:number;
}) {

  return (

    <div className="bg-gray-50 rounded-xl border p-5">

      <p className="text-sm text-gray-500">
        {titulo}
      </p>

      <h3 className="text-3xl font-bold text-gray-800 mt-2">
        {valor}
      </h3>

    </div>

  );

}