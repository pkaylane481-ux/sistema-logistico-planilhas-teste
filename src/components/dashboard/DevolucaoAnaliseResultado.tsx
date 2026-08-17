interface Props {
  devolucoes: any[];
}

export default function DevolucaoAnaliseResultado({
  devolucoes
}: Props) {


  const total = devolucoes.length;


  const reenvios = devolucoes.filter(
    item =>
      item.decisao_final === "Reenviado"
  ).length;


  const estornos = devolucoes.filter(
    item =>
      item.decisao_final === "Estornado"
  ).length;


  const estoque = devolucoes.filter(
    item =>
      item.destino === "Estoque"
  ).length;



  function percentual(valor:number){

    if(total === 0){
      return "0%";
    }

    return (
      ((valor / total) * 100)
      .toFixed(1) + "%"
    );

  }



  const eficiencia =
    total > 0
    ?
    ((reenvios / total) * 100)
    .toFixed(1)
    :
    "0";



  const indicadores = [

    {
      titulo:"Taxa de Reenvio",
      valor:percentual(reenvios),
      descricao:
        "Casos recuperados através de novo envio",
      cor:"#7c3aed"
    },

    {
      titulo:"Taxa de Estorno",
      valor:percentual(estornos),
      descricao:
        "Casos encerrados com devolução financeira",
      cor:"#dc2626"
    },

    {
      titulo:"Destino Estoque",
      valor:percentual(estoque),
      descricao:
        "Peças retornadas ao estoque",
      cor:"#2563eb"
    },

    {
      titulo:"Eficiência Operacional",
      valor: `${eficiencia}%`,
      descricao:
        "Conversão de devolução em reenvio",
      cor:"#16a34a"
    }

  ];



  return (

    <div

      style={{

        background:"#fff",

        borderRadius:"14px",

        padding:"20px",

        marginBottom:"25px",

        boxShadow:
          "0 3px 10px rgba(0,0,0,.08)"

      }}

    >

      <h2

        style={{

          fontSize:"20px",

          fontWeight:"bold",

          marginBottom:"20px"

        }}

      >

        Análise de Resultado

      </h2>



      <div

        style={{

          display:"grid",

          gridTemplateColumns:
            "repeat(4,1fr)",

          gap:"18px"

        }}

      >


      {indicadores.map(item=>(


        <div

          key={item.titulo}

          style={{

            borderLeft:
              `6px solid ${item.cor}`,

            padding:"15px",

            background:"#fafafa",

            borderRadius:"10px"

          }}

        >

          <div

            style={{

              fontSize:"14px",

              color:"#666"

            }}

          >

            {item.titulo}

          </div>


          <div

            style={{

              fontSize:"30px",

              fontWeight:"bold",

              color:item.cor,

              margin:"8px 0"

            }}

          >

            {item.valor}

          </div>


          <div

            style={{

              fontSize:"12px",

              color:"#777"

            }}

          >

            {item.descricao}

          </div>


        </div>


      ))}


      </div>


    </div>

  );

}