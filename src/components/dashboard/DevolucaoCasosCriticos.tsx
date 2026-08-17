interface Props {
  devolucoes: any[];
}

export default function DevolucaoCasosCriticos({
  devolucoes
}: Props) {


  const hoje = new Date();


  const casos = devolucoes.filter(item => {


    const contatos =
      item.contatos ?? 
      item.quantidade_contatos ??
      0;


    const semDecisao =
      !item.decisao_final;


    const dataRegistro =
      item.data
      ? new Date(item.data)
      : null;


    const diasParado =
      dataRegistro
      ?
      Math.floor(
        (
          hoje.getTime() -
          dataRegistro.getTime()
        )
        /
        (1000 * 60 * 60 * 24)
      )
      :
      0;



    return (

      (contatos >= 3 && semDecisao)

      ||

      (
        diasParado >= 4 &&
        semDecisao
      )

      ||

      item.status === "Aguardando cliente"

      ||

      item.status === "Em contato"

    );


  });



  return (

    <div

      style={{

        background:"#fff",

        padding:"20px",

        borderRadius:"14px",

        marginTop:"25px",

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

        🚨 Casos Críticos

      </h2>



      {
        casos.length === 0

        ?

        (

          <p>
            Nenhum caso crítico encontrado.
          </p>

        )

        :

        (

        <div

          style={{

            overflowX:"auto"

          }}

        >

        <table

          style={{

            width:"100%",

            borderCollapse:"collapse"

          }}

        >

        <thead>

        <tr>

          <th>
            Pedido
          </th>

          <th>
            Cliente
          </th>

          <th>
            Status
          </th>

          <th>
            Contatos
          </th>

          <th>
            Dias parado
          </th>

          <th>
            Decisão
          </th>

        </tr>

        </thead>


        <tbody>


        {casos.map(item=>{


          const dataRegistro =
          item.data
          ?
          new Date(item.data)
          :
          null;


          const dias =
          dataRegistro
          ?
          Math.floor(
            (
              hoje.getTime()
              -
              dataRegistro.getTime()
            )
            /
            (1000*60*60*24)
          )
          :
          0;



          return (

          <tr

            key={item.id}

          >


            <td>
              {item.pedido || "-"}
            </td>


            <td>
              {item.cliente || "-"}
            </td>


            <td>

              <strong>

              {item.status || "-"}

              </strong>

            </td>


            <td>

              {item.contatos ?? 0}

            </td>


            <td>

              {dias} dias

            </td>


            <td>

              {item.decisao_final || "Pendente"}

            </td>


          </tr>

          );


        })}


        </tbody>


        </table>

        </div>

        )

      }


    </div>

  );

}