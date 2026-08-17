import { useMemo, useState } from "react";

import { useSistema } from "../context/SistemaContext";

import FiltroRegistros from "../components/FiltroRegistros";

import ExportarExcel from "../components/ExportarExcel";
import { supabase } from "../services/supabase";
import { registrarEtapaProdutividade } from "../services";

type AbaTrocas = "Troquecommerce" | "Marketplace" | "Falhas";



export default function TrocasDevolucoes() {

  function obterDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }


  const sistema = useSistema();

  const {

  trocas,
  adicionarTroca,
  removerTroca,

  marketplaces,
  operadores,
  atividades,

  produtos,
  motivos,
  transportadoras

} = sistema;

const atualizarTroca = (sistema as any).atualizarTroca as
  | ((id: string | number, dados: { status: string }) => Promise<void>)
  | undefined;

const carregarDados = (sistema as any).carregarDados as
  | (() => Promise<void>)
  | undefined;

 


  // ============================
  // ABAS
  // ============================


  const [aba, setAba] = useState<AbaTrocas>("Troquecommerce");





  // ============================
  // FILTROS
  // ============================


  const [listaFiltrada, setListaFiltrada] = useState<any[] | null>(null);
  const [operadorAcaoStatus, setOperadorAcaoStatus] = useState("");






  // ============================
  // TROQUECOMMERCE
  // ============================


  const [data, setData] = useState("");

  const [quantidade, setQuantidade] = useState(0);

  const [operador, setOperador] = useState("");

  const [atividade, setAtividade] = useState("");

  const [statusTroquecommerce, setStatusTroquecommerce] = useState("Registrado");






  // ============================
  // MARKETPLACE
  // ============================


  const [mpPedido, setMpPedido] = useState("");

  const [mpCliente, setMpCliente] = useState("");

  const [mpMarketplace, setMpMarketplace] = useState("");

  const [mpOperador, setMpOperador] = useState("");

  const [video, setVideo] = useState("");

  const [teveErro, setTeveErro] = useState("Não");

  const [mpData, setMpData] = useState(obterDataHoje);

  const [statusMarketplace, setStatusMarketplace] = useState("Registrado");






  // ============================
  // FALHAS
  // ============================


  const [tipoFalha, setTipoFalha] = useState(
    "Falha de Peça"
  );

  const [statusFalha, setStatusFalha] = useState("Registrado");
  const [fpResponsavel, setFpResponsavel] = useState("");


  const [fpProduto, setFpProduto] = useState("");

  const [fpSku, setFpSku] = useState("");

  const [fpMotivo, setFpMotivo] = useState("");

  const [fpPedido, setFpPedido] = useState("");

  const [fpData, setFpData] = useState(obterDataHoje);

  const [fpCor, setFpCor] = useState("");

const [fpTamanho, setFpTamanho] = useState("");



  const [feTransportadora, setFeTransportadora] = useState("");

  const [feRastreio, setFeRastreio] = useState("");

  const [feResponsabilidade, setFeResponsabilidade] = useState("");

  const [fePedido, setFePedido] = useState("");

  const [feCliente, setFeCliente] = useState("");

  const [feEntrega, setFeEntrega] = useState("");

  const [feRegistro, setFeRegistro] = useState(obterDataHoje);




  // ============================
  // ESTILOS
  // ============================


  const inputStyle = {

    padding: "10px",

    border: "1px solid #ddd",

    borderRadius: "8px",

    width: "100%"

  };



  const cardStyle = {

    background: "#fff",

    padding: "20px",

    borderRadius: "12px",

    boxShadow: "0 3px 10px rgba(0,0,0,.08)",

    display: "flex",

    flexDirection: "column" as const,

    gap: "12px"

  };



  const buttonStyle = {

    padding: "12px 20px",

    background: "#7c3aed",

    color: "#fff",

    border: "none",

    borderRadius: "10px",

    cursor: "pointer",

    fontWeight: "bold" as const

  };





  // ============================
  // SALVAR TROQUECOMMERCE
  // ============================


  async function salvarTroquecommerce() {


    if (!data || !operador || !atividade) {

      alert("Preencha todos os campos.");

      return;

    }


    await adicionarTroca({

      tipo: "Troquecommerce",

      data_entrada: data,

      quantidade,

      operador,

      atividade,

      pedido: "",

      cliente: "",

      produto: "",

      marketplace: "",

      motivo: "",

      responsavel: operador,

      status: statusTroquecommerce,

      observacao: ""

    });


    const produtividadeRegistrada = await registrarEtapaProdutividade({
      operador,
      atividade,
      processo: "Troquecommerce",
      quantidade: quantidade || 1,
      data
    });
    if (carregarDados) await carregarDados();

    setData("");

    setQuantidade(0);

    setOperador("");

    setAtividade("");

    setStatusTroquecommerce("Registrado");

    if (!produtividadeRegistrada) {
      window.alert("Registro salvo, mas não foi possível contabilizar a produtividade.");
    }

  }





  // ============================
  // SALVAR MARKETPLACE
  // ============================


  async function salvarMarketplace() {
    if (!mpPedido.trim() || !mpMarketplace || !mpOperador || !mpData) {
      window.alert("Preencha Pedido, Marketplace, Operador e Data.");
      return;
    }

    try {
      await adicionarTroca({

      tipo: "Marketplace",

      data_entrada: mpData,

      quantidade: 0,

      operador: mpOperador,

      atividade: "",

      pedido: mpPedido,

      cliente: mpCliente,

      produto: "",

      marketplace: mpMarketplace,

      motivo: teveErro === "Sim"
        ? "Com erro"
        : "Sem erro",

      responsavel: mpOperador,

      status: statusMarketplace,

      observacao: video

      });


    const produtividadeRegistrada = await registrarEtapaProdutividade({
      operador: mpOperador,
      atividade: "Registro de devolução Marketplace",
      processo: "Marketplace",
      pedido: mpPedido,
      data: mpData
    });
    if (carregarDados) await carregarDados();

    setMpPedido("");

    setMpCliente("");

    setMpMarketplace("");

    setMpOperador("");

    setVideo("");

      setMpData(obterDataHoje());
      setTeveErro("Não");
      setStatusMarketplace("Registrado");
      window.alert(
        produtividadeRegistrada
          ? "Registro de Marketplace salvo e produtividade contabilizada."
          : "Registro salvo, mas não foi possível contabilizar a produtividade."
      );
    } catch (error) {
      console.error("Erro ao registrar Marketplace:", error);
      window.alert("Não foi possível registrar o Marketplace.");
    }

  }
    // ============================
  // SALVAR FALHAS
  // ============================


  async function salvarFalha() {


    if (tipoFalha === "Falha de Peça") {

      if (!fpSku.trim() || !fpPedido.trim() || !fpResponsavel) {
        window.alert("Informe SKU, pedido e operador responsável.");
        return;
      }


      await adicionarTroca({

        tipo: "Falha de Peça",

        data_entrada: fpData,

        quantidade: 0,

        operador: fpResponsavel,

        atividade: "",

        pedido: fpPedido,

        cliente: "",

        sku: fpSku,

produto: fpProduto,

cor: fpCor,

tamanho: fpTamanho,

        marketplace: "",

        motivo: fpMotivo,

        responsavel: fpResponsavel,

        status: statusFalha,

        observacao: `SKU: ${fpSku}`

      });



      const produtividadeRegistrada = await registrarEtapaProdutividade({
        operador: fpResponsavel,
        atividade: "Registro de falha de peça",
        processo: "Falhas",
        pedido: fpPedido,
        data: fpData,
        observacao: `SKU: ${fpSku}`
      });
      if (carregarDados) await carregarDados();

      setFpProduto("");

      setFpSku("");

      setFpCor("");

      setFpTamanho("");

      setFpMotivo("");

      setFpPedido("");

      setFpData(obterDataHoje());

      setStatusFalha("Registrado");

      setFpResponsavel("");

      if (!produtividadeRegistrada) {
        window.alert("Falha salva, mas não foi possível contabilizar a produtividade.");
      }



    } else {



      if (!fePedido.trim() || !feResponsabilidade) {
        window.alert("Informe o pedido e o operador responsável.");
        return;
      }

      await adicionarTroca({

        tipo: "Falha de Entrega",

        data_entrada: feRegistro,

        quantidade: 0,

        operador: "",

        atividade: "",

        pedido: fePedido,

        cliente: feCliente,

        produto: "",

        marketplace: "",

        motivo: "Falha de Entrega",

        responsavel: feResponsabilidade,

        status: statusFalha,

        observacao:
          `Transportadora: ${feTransportadora} | Rastreio: ${feRastreio} | Entrega: ${feEntrega}`

      });



      setFeTransportadora("");

      const produtividadeRegistradaEntrega = await registrarEtapaProdutividade({
        operador: feResponsabilidade,
        atividade: "Registro de falha de entrega",
        processo: "Falhas",
        pedido: fePedido,
        data: feRegistro
      });
      if (carregarDados) await carregarDados();

      setFeRastreio("");

      setFeResponsabilidade("");

      setFePedido("");

      setFeCliente("");

      setFeEntrega("");

      setFeRegistro(obterDataHoje());

      setStatusFalha("Registrado");

      if (!produtividadeRegistradaEntrega) {
        window.alert("Falha salva, mas não foi possível contabilizar a produtividade.");
      }

    }


  }

  async function alterarStatusRegistro(item: any, novoStatus: string) {
    if (!operadorAcaoStatus) {
      window.alert("Selecione o operador responsável pela alteração de status.");
      return;
    }

    try {
      if (atualizarTroca) {
        await atualizarTroca(item.id, { status: novoStatus });
      } else {
        const { error } = await supabase
          .from("trocas_devolucoes")
          .update({ status: novoStatus })
          .eq("id", item.id);

        if (error) throw error;
      }

      if (carregarDados) {
        await carregarDados();
      }

      const produtividadeRegistrada = await registrarEtapaProdutividade({
        operador: operadorAcaoStatus,
        atividade: novoStatus === "Finalizado"
          ? `Conclusão - ${item.tipo || aba}`
          : `Atualização de status - ${item.tipo || aba}`,
        processo: item.tipo || aba,
        pedido: item.pedido || undefined,
        registroId: String(item.id),
        observacao: `${item.status || "Sem status"} → ${novoStatus}`
      });
      if (carregarDados) await carregarDados();

      if (!produtividadeRegistrada) {
        window.alert("Status alterado, mas não foi possível contabilizar a produtividade.");
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      window.alert("Não foi possível alterar o status.");
    }
  }






  // ============================
  // REGISTROS POR ABA
  // ============================


  const registros = useMemo(() => {


    const lista = trocas || [];


    return lista.filter(item => {


      if (aba === "Troquecommerce") {

        return item.tipo === "Troquecommerce";

      }


      if (aba === "Marketplace") {

        return item.tipo === "Marketplace";

      }


      return (

        item.tipo === "Falha de Peça" ||

        item.tipo === "Falha de Entrega"

      );


    });



  }, [trocas, aba]);







  const registrosExibidos = listaFiltrada ?? registros;







  // ============================
  // EXPORTAÇÃO
  // ============================


  const colunasExportacao = [


    {
      campo: "tipo",
      titulo: "Tipo"
    },


    {
      campo: "dataEntrada",
      titulo: "Data"
    },


    {
      campo: "quantidade",
      titulo: "Quantidade"
    },


    {
      campo: "operador",
      titulo: "Operador"
    },


    {
      campo: "atividade",
      titulo: "Atividade"
    },


    {
      campo: "pedido",
      titulo: "Pedido"
    },


    {
      campo: "cliente",
      titulo: "Cliente"
    },


    {
      campo: "marketplace",
      titulo: "Marketplace"
    },


    {
      campo: "motivo",
      titulo: "Motivo"
    },


    {
      campo: "responsavel",
      titulo: "Responsável"
    },


    {
      campo: "status",
      titulo: "Status"
    },


    {
      campo: "observacao",
      titulo: "Observação"
    }


  ];







  return (


    <div className="p-6" style={{ minHeight: "100vh", background: "#f8fafc" }}>



      {/* CABEÇALHO */}


<div

className="
w-full
bg-gradient-to-r
from-purple-900
to-purple-800
rounded-2xl
px-6
py-5
mb-6
flex
items-center
justify-between
shadow-sm
"

>


<div>

<h1

className="
text-2xl
font-bold
text-white
"

>

Trocas e Devoluções

</h1>


<p

className="
text-purple-200
text-sm
mt-1
"

>

Gestão de trocas, devoluções e ocorrências operacionais

</p>


</div>



<ExportarExcel

dados={registrosExibidos}

nomeArquivo="trocas_devolucoes"

nomeAba="Trocas"

titulo="Exportar Excel"

colunas={colunasExportacao}

/>



</div>

      {/* FILTROS */}
      <div style={{ marginBottom: "22px" }}>
        <FiltroRegistros
          registros={registros}
          operadores={operadores || []}
          atividades={atividades || []}
          onFiltrar={(dados) => setListaFiltrada(dados)}
        />
      </div>

      {/* ABAS */}


      <div

        style={{

          display: "flex",

          gap: "12px",

          marginBottom: "25px"

        }}

      >



        <button

          style={{

            ...buttonStyle,

            background:

              aba === "Troquecommerce"

                ? "#7c3aed"

                : "#ddd",

            color:

              aba === "Troquecommerce"

                ? "#fff"

                : "#333"

          }}

          onClick={() => {

            setAba("Troquecommerce");

            setListaFiltrada(null);

          }}

        >

          Troquecommerce

        </button>





        <button

          style={{

            ...buttonStyle,

            background:

              aba === "Marketplace"

                ? "#7c3aed"

                : "#ddd",

            color:

              aba === "Marketplace"

                ? "#fff"

                : "#333"

          }}

          onClick={() => {

            setAba("Marketplace");

            setListaFiltrada(null);

          }}

        >

          Marketplace

        </button>





        <button

          style={{

            ...buttonStyle,

            background:

              aba === "Falhas"

                ? "#7c3aed"

                : "#ddd",

            color:

              aba === "Falhas"

                ? "#fff"

                : "#333"

          }}

          onClick={() => {

            setAba("Falhas");

            setListaFiltrada(null);

          }}

        >

          Falhas

        </button>



      </div>

      <MiniDashboard aba={aba} registros={registrosExibidos} />






      {/* FORM TROQUECOMMERCE */}


      {

        aba === "Troquecommerce" && (


          <div style={cardStyle}>


            <h2>

              Troquecommerce

            </h2>



            <label>

              Data

            </label>


            <input

              type="date"

              style={inputStyle}

              value={data}

              onChange={(e) => setData(e.target.value)}

            />





            <label>

              Quantidade

            </label>


            <input

              type="number"

              style={inputStyle}

              value={quantidade}

              onChange={(e) =>
                setQuantidade(Number(e.target.value))
              }

            />





            <label>

              Operador

            </label>


            <select

              style={inputStyle}

              value={operador}

              onChange={(e) =>
                setOperador(e.target.value)
              }

            >


              <option value="">

                Selecione

              </option>


              {

                (operadores || []).map(item => (


                  <option

                    key={item.id}

                    value={item.nome}

                  >

                    {item.nome}

                  </option>


                ))

              }


            </select>





            <label>

              Atividade

            </label>


            <select

              style={inputStyle}

              value={atividade}

              onChange={(e) =>
                setAtividade(e.target.value)
              }

            >


              <option value="">

                Selecione

              </option>



              {

                (atividades || []).map(item => (


                  <option

                    key={item.id}

                    value={item.nome}

                  >

                    {item.nome}

                  </option>


                ))

              }


            </select>

            <label>Status</label>
            <select
              style={inputStyle}
              value={statusTroquecommerce}
              onChange={(e) => setStatusTroquecommerce(e.target.value)}
            >
              <option>Registrado</option>
              <option>Pendente</option>
              <option>Em andamento</option>
              <option>Finalizado</option>
              <option>Cancelado</option>
            </select>





            <button

              style={buttonStyle}

              onClick={salvarTroquecommerce}

            >

              ➕ Registrar Troquecommerce

            </button>



          </div>


        )

      }







      {/* FORM MARKETPLACE */}


      {

        aba === "Marketplace" && (


          <div style={cardStyle}>


            <h2>

              Marketplace

            </h2>





            <input

              style={inputStyle}

              placeholder="Pedido"

              value={mpPedido}

              onChange={(e) =>
                setMpPedido(e.target.value)
              }

            />





            <input

              style={inputStyle}

              placeholder="Cliente"

              value={mpCliente}

              onChange={(e) =>
                setMpCliente(e.target.value)
              }

            />





            <select

              style={inputStyle}

              value={mpMarketplace}

              onChange={(e) =>
                setMpMarketplace(e.target.value)
              }

            >


              <option value="">

                Selecione Marketplace

              </option>



              {

                (marketplaces || []).map(item => (


                  <option

                    key={item.id}

                    value={item.nome}

                  >

                    {item.nome}

                  </option>


                ))

              }



            </select>





            <select

style={inputStyle}

value={mpOperador}

onChange={(e)=>
setMpOperador(e.target.value)
}

>

<option value="">
Selecione Operador
</option>


{
(operadores || []).map(item=>(

<option

key={item.id}

value={item.nome}

>

{item.nome}

</option>

))
}


</select>





            <input

              style={inputStyle}

              placeholder="Link do vídeo"

              value={video}

              onChange={(e) =>
                setVideo(e.target.value)
              }

            />





            <label>

              Teve erro?

            </label>


            <select

              style={inputStyle}

              value={teveErro}

              onChange={(e) =>
                setTeveErro(e.target.value)
              }

            >


              <option value="Não">

                Não

              </option>


              <option value="Sim">

                Sim

              </option>


            </select>





            <label>

              Data

            </label>


            <input

              type="date"

              style={inputStyle}

              value={mpData}

              onChange={(e) =>
                setMpData(e.target.value)
              }

            />

            <label>Status</label>
            <select
              style={inputStyle}
              value={statusMarketplace}
              onChange={(e) => setStatusMarketplace(e.target.value)}
            >
              <option>Registrado</option>
              <option>Pendente</option>
              <option>Em andamento</option>
              <option>Finalizado</option>
              <option>Cancelado</option>
            </select>





            <button

              style={buttonStyle}

              onClick={salvarMarketplace}

            >

              ➕ Registrar Marketplace

            </button>



          </div>


        )

      }







      {/* FORM FALHAS */}


      {

        aba === "Falhas" && (


          <div style={cardStyle}>


            <h2>

              Falhas

            </h2>





            <select

              style={inputStyle}

              value={tipoFalha}

              onChange={(e) =>
                setTipoFalha(e.target.value)
              }

            >


              <option value="Falha de Peça">

                Falha de Peça

              </option>



              <option value="Falha de Entrega">

                Falha de Entrega

              </option>


            </select>





            {

              tipoFalha === "Falha de Peça"

                ? (


                  <div>


  <input
  style={inputStyle}
  list="catalogo-produtos-sku"
  placeholder="Digite ou selecione o SKU"
  value={fpSku}
  onChange={(e) => {
    const skuDigitado = e.target.value.trim().toUpperCase();
    setFpSku(skuDigitado);

    const encontrado = produtos.find(
      item => item.sku?.trim().toUpperCase() === skuDigitado
    );

    if (encontrado) {
      setFpProduto(encontrado.produto ?? "");
      setFpCor(encontrado.cor ?? "");
      setFpTamanho(encontrado.tamanho ?? "");
    } else {
      setFpProduto("");
      setFpCor("");
      setFpTamanho("");
    }
  }}
  />

  <datalist id="catalogo-produtos-sku">
    {(produtos || []).map((item) => (
      <option key={item.id} value={item.sku}>
        {item.produto} — {item.cor} — {item.tamanho}
      </option>
    ))}
  </datalist>

<input
  style={inputStyle}
  value={fpProduto}
  readOnly
  placeholder="Produto"
/>

<input
  style={inputStyle}
  value={fpCor}
  readOnly
  placeholder="Cor"
/>

<input
  style={inputStyle}
  value={fpTamanho}
  readOnly
  placeholder="Tamanho"



/>

<select

style={inputStyle}

value={fpMotivo}

onChange={(e)=>
setFpMotivo(e.target.value)
}

>

<option value="">
Selecione Motivo
</option>


{

(motivos || []).map(item=>(

<option

key={item.id}

value={item.nome}

>

{item.nome}

</option>

))

}


</select>

                    <input

                      style={inputStyle}

                      placeholder="Pedido"

                      value={fpPedido}

                      onChange={(e) =>
                        setFpPedido(e.target.value)
                      }

                    />

                    <select style={inputStyle} value={fpResponsavel} onChange={(e) => setFpResponsavel(e.target.value)}>
                      <option value="">Operador que registrou a falha</option>
                      {(operadores || []).map((item) => (
                        <option key={item.id} value={item.nome}>{item.nome}</option>
                      ))}
                    </select>




                    <label>

                      Data

                    </label>



                    <input

                      type="date"

                      style={inputStyle}

                      value={fpData}

                      onChange={(e) =>
                        setFpData(e.target.value)
                      }

                    />


                  </div>


                )


                : (


                  <div>


                    <select

style={inputStyle}

value={feTransportadora}

onChange={(e)=>
setFeTransportadora(e.target.value)
}

>

<option value="">
Selecione Transportadora
</option>


{

(transportadoras || []).map(item=>(

<option

key={item.id}

value={item.nome}

>

{item.nome}

</option>

))

}


</select>




                    <input

                      style={inputStyle}

                      placeholder="Rastreio"

                      value={feRastreio}

                      onChange={(e) =>
                        setFeRastreio(e.target.value)
                      }

                    />




                    <select

style={inputStyle}

value={feResponsabilidade}

onChange={(e)=>
setFeResponsabilidade(e.target.value)
}

>

<option value="">
Selecione Operador
</option>


{

(operadores || []).map(item=>(

<option

key={item.id}

value={item.nome}

>

{item.nome}

</option>

))

}


</select>




                    <input

                      style={inputStyle}

                      placeholder="Pedido"

                      value={fePedido}

                      onChange={(e) =>
                        setFePedido(e.target.value)
                      }

                    />




                    <input

                      style={inputStyle}

                      placeholder="Cliente"

                      value={feCliente}

                      onChange={(e) =>
                        setFeCliente(e.target.value)
                      }

                    />




                    <label>

                      Data entrega

                    </label>



                    <input

                      type="date"

                      style={inputStyle}

                      value={feEntrega}

                      onChange={(e) =>
                        setFeEntrega(e.target.value)
                      }

                    />




                    <label>

                      Data registro

                    </label>



                    <input

                      type="date"

                      style={inputStyle}

                      value={feRegistro}

                      onChange={(e) =>
                        setFeRegistro(e.target.value)
                      }

                    />



                  </div>


                )


            }

            <label>Status</label>
            <select
              style={inputStyle}
              value={statusFalha}
              onChange={(e) => setStatusFalha(e.target.value)}
            >
              <option>Registrado</option>
              <option>Pendente</option>
              <option>Em andamento</option>
              <option>Finalizado</option>
              <option>Cancelado</option>
            </select>





            <button

              style={buttonStyle}

              onClick={salvarFalha}

            >

              ➕ Registrar Falha

            </button>



          </div>


        )

      }
            {/* LISTAGEM DE REGISTROS */}


      <div

        style={{

          marginTop: "35px"

        }}

      >


        <div style={{ ...cardStyle, marginBottom: "16px", borderLeft: "5px solid #7c3aed" }}>
          <label style={{ fontWeight: 800, color: "#4c1d95" }}>Operador responsável pela próxima alteração de status</label>
          <select style={inputStyle} value={operadorAcaoStatus} onChange={(e) => setOperadorAcaoStatus(e.target.value)}>
            <option value="">Selecione antes de alterar um status</option>
            {(operadores || []).map((item) => (
              <option key={item.id} value={item.nome}>{item.nome}</option>
            ))}
          </select>
        </div>

        <h2

          style={{

            fontSize: "22px",

            fontWeight: "bold",

            marginBottom: "15px"

          }}

        >

          Registros

        </h2>





        <div style={cardStyle}>



          {

            registrosExibidos.length === 0 ? (


              <p>

                Nenhum registro encontrado.

              </p>


            )


            : (
              <TabelaRegistros
                aba={aba}
                registros={registrosExibidos}
                onAlterarStatus={alterarStatusRegistro}
                onExcluir={async (item) => {
                  const confirmar = window.confirm("Excluir este registro?");
                  if (confirmar) {
                    await removerTroca(item.id);
                    if (carregarDados) {
                      await carregarDados();
                    }
                  }
                }}
              />
            )


          }



        </div>



      </div>




    </div>


  );


}

const statusDisponiveis = [
  "Registrado",
  "Pendente",
  "Em andamento",
  "Finalizado",
  "Cancelado"
];

function obterDataRegistro(item: any) {
  const valor = item.dataEntrada || item.data_entrada || item.data;
  if (!valor) return "-";

  const data = new Date(`${String(valor).slice(0, 10)}T00:00:00`);
  return Number.isNaN(data.getTime())
    ? String(valor)
    : data.toLocaleDateString("pt-BR");
}

function SeletorStatus({
  item,
  onAlterar
}: {
  item: any;
  onAlterar: (item: any, status: string) => Promise<void>;
}) {
  return (
    <select
      value={item.status || "Registrado"}
      onChange={(e) => void onAlterar(item, e.target.value)}
      style={{
        minWidth: "145px",
        padding: "8px 10px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        background: "#fff",
        color: "#374151",
        fontWeight: 600
      }}
    >
      {statusDisponiveis.map((status) => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>
  );
}

function BotaoExcluir({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "#dc2626",
        color: "#fff",
        border: "none",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 700
      }}
    >
      Excluir
    </button>
  );
}

function TabelaRegistros({
  aba,
  registros,
  onAlterarStatus,
  onExcluir
}: {
  aba: AbaTrocas;
  registros: any[];
  onAlterarStatus: (item: any, status: string) => Promise<void>;
  onExcluir: (item: any) => Promise<void>;
}) {
  const thStyle = { padding: "12px", textAlign: "left" as const };
  const tdStyle = { padding: "12px" };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse" }}>
        <thead>
          {aba === "Troquecommerce" && (
            <tr style={{ background: "#f5f3ff", color: "#4c1d95" }}>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Atividade</th>
              <th style={thStyle}>Quantidade</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Responsável</th>
              <th style={thStyle}>Ação</th>
            </tr>
          )}

          {aba === "Marketplace" && (
            <tr style={{ background: "#f5f3ff", color: "#4c1d95" }}>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Pedido</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Marketplace</th>
              <th style={thStyle}>Responsável</th>
              <th style={thStyle}>Ação</th>
            </tr>
          )}

          {aba === "Falhas" && (
            <tr style={{ background: "#f5f3ff", color: "#4c1d95" }}>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Pedido</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Responsável</th>
              <th style={thStyle}>Ação</th>
            </tr>
          )}
        </thead>

        <tbody>
          {registros.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              {aba === "Troquecommerce" && (
                <>
                  <td style={tdStyle}>{obterDataRegistro(item)}</td>
                  <td style={tdStyle}>{item.atividade || "-"}</td>
                  <td style={{ ...tdStyle, fontWeight: 800 }}>{Number(item.quantidade || 0)}</td>
                  <td style={tdStyle}><SeletorStatus item={item} onAlterar={onAlterarStatus} /></td>
                  <td style={tdStyle}>{item.responsavel || item.operador || "-"}</td>
                  <td style={tdStyle}><BotaoExcluir onClick={() => void onExcluir(item)} /></td>
                </>
              )}

              {aba === "Marketplace" && (
                <>
                  <td style={tdStyle}>{obterDataRegistro(item)}</td>
                  <td style={tdStyle}>{item.pedido || "-"}</td>
                  <td style={tdStyle}>{item.cliente || "-"}</td>
                  <td style={tdStyle}>{item.marketplace || "-"}</td>
                  <td style={tdStyle}>{item.responsavel || item.operador || "-"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <SeletorStatus item={item} onAlterar={onAlterarStatus} />
                      <BotaoExcluir onClick={() => void onExcluir(item)} />
                    </div>
                  </td>
                </>
              )}

              {aba === "Falhas" && (
                <>
                  <td style={tdStyle}>{obterDataRegistro(item)}</td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{item.tipo || "-"}</td>
                  <td style={tdStyle}>{item.pedido || "-"}</td>
                  <td style={tdStyle}><SeletorStatus item={item} onAlterar={onAlterarStatus} /></td>
                  <td style={tdStyle}>{item.responsavel || item.operador || "-"}</td>
                  <td style={tdStyle}><BotaoExcluir onClick={() => void onExcluir(item)} /></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const miniCardStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)"
};

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function agruparQuantidade(registros: any[], campo: string) {
  const totais = registros.reduce<Record<string, number>>((acc, item) => {
    const nome = String(item[campo] || "Não informado");
    acc[nome] = (acc[nome] || 0) + Number(item.quantidade || 0);
    return acc;
  }, {});

  return Object.entries(totais).sort((a, b) => b[1] - a[1]);
}

function agruparContagem(registros: any[], campo: string) {
  const totais = registros.reduce<Record<string, number>>((acc, item) => {
    const nome = String(item[campo] || "Não informado");
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(totais).sort((a, b) => b[1] - a[1]);
}

function MiniDashboard({ aba, registros }: { aba: AbaTrocas; registros: any[] }) {
  return (
    <section style={{ display: "grid", gap: "20px", marginBottom: "24px" }}>
      {aba === "Troquecommerce" && <DashboardTroquecommerce registros={registros} />}
      {aba === "Marketplace" && <DashboardMarketplace registros={registros} />}
      {aba === "Falhas" && <DashboardFalhas registros={registros} />}
    </section>
  );
}

function DashboardTroquecommerce({ registros }: { registros: any[] }) {
  const atividadesEsperadas = [
    "Recebimento",
    "Análise",
    "Abertura",
    "NFD",
    "Peças à Qualidade"
  ];

  const atividades: Array<[string, number]> = atividadesEsperadas.map((atividade) => {
    const chave = normalizarTexto(atividade);
    const total = registros
      .filter((item) => normalizarTexto(item.atividade) === chave)
      .reduce((soma, item) => soma + Number(item.quantidade || 0), 0);
    return [atividade, total];
  });

  const responsaveis = agruparQuantidade(registros, "responsavel").slice(0, 8);
  const evolucao = agruparEvolucaoDiaria(registros);
  const totalProduzido = registros.reduce((soma, item) => soma + Number(item.quantidade || 0), 0);
  const pendentes = registros.filter((item) => normalizarTexto(item.status) === "pendente").length;
  const emAndamento = registros.filter((item) => normalizarTexto(item.status) === "em andamento").length;
  const finalizados = registros.filter((item) => normalizarTexto(item.status) === "finalizado").length;
  const taxaFinalizacao = registros.length ? (finalizados / registros.length) * 100 : 0;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "15px" }}>
        <MiniKpi titulo="Total produzido" valor={totalProduzido} icone="📦" cor="#7c3aed" />
        <MiniKpi titulo="Registros pendentes" valor={pendentes} icone="⏳" cor="#f59e0b" />
        <MiniKpi titulo="Em andamento" valor={emAndamento} icone="🔄" cor="#0ea5e9" />
        <MiniKpi titulo="Finalizados" valor={finalizados} icone="✅" cor="#16a34a" />
        <MiniKpi titulo="Taxa de finalização" valor={`${taxaFinalizacao.toFixed(1)}%`} icone="📊" cor="#2563eb" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "20px" }}>
        <GraficoVertical titulo="Produção por atividade" dados={atividades} cor="#7c3aed" />
        <GraficoPizza titulo="Produção por responsável" dados={responsaveis} />
      </div>
      <GraficoLinhaDiaria titulo="Evolução diária da produção" dados={evolucao} />
    </>
  );
}

function DashboardMarketplace({ registros }: { registros: any[] }) {
  const comErro = registros.filter((item) => normalizarTexto(item.motivo) === "com erro").length;
  const semErro = registros.length - comErro;
  const taxaErro = registros.length ? (comErro / registros.length) * 100 : 0;
  const errosMarketplace = agruparContagem(
    registros.filter((item) => normalizarTexto(item.motivo) === "com erro"),
    "marketplace"
  ).slice(0, 8);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
        <MiniKpi titulo="Total de registros" valor={registros.length} icone="🛒" cor="#7c3aed" />
        <MiniKpi titulo="Registros com erro" valor={comErro} icone="⚠️" cor="#dc2626" />
        <MiniKpi titulo="Registros sem erro" valor={semErro} icone="✅" cor="#16a34a" />
        <MiniKpi titulo="Taxa de erro" valor={`${taxaErro.toFixed(1)}%`} icone="📊" cor="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "20px" }}>
        <GraficoDonutMarketplace comErro={comErro} semErro={semErro} />
        <GraficoHorizontal titulo="Erros por marketplace" dados={errosMarketplace} cor="#dc2626" />
      </div>
    </>
  );
}

function DashboardFalhas({ registros }: { registros: any[] }) {
  const falhasPeca = registros.filter((item) => item.tipo === "Falha de Peça");
  const falhasEntrega = registros.filter((item) => item.tipo === "Falha de Entrega");
  const statusEntrega = (status: string) =>
    falhasEntrega.filter((item) => normalizarTexto(item.status) === normalizarTexto(status)).length;

  const motivosPeca = agruparContagem(falhasPeca, "motivo").slice(0, 7);
  const transportadoras = agruparTransportadoras(falhasEntrega).slice(0, 8);
  const produtos = agruparProdutos(falhasPeca).slice(0, 8);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: "14px" }}>
        <MiniKpi titulo="Total de falhas" valor={registros.length} icone="⚠️" cor="#7c3aed" />
        <MiniKpi titulo="Falhas de peça" valor={falhasPeca.length} icone="👕" cor="#dc2626" />
        <MiniKpi titulo="Falhas de entrega" valor={falhasEntrega.length} icone="🚚" cor="#2563eb" />
        <MiniKpi titulo="Pendentes" valor={statusEntrega("Pendente")} icone="⏳" cor="#f59e0b" detalhe="Somente entrega" />
        <MiniKpi titulo="Em andamento" valor={statusEntrega("Em andamento")} icone="🔄" cor="#0ea5e9" detalhe="Somente entrega" />
        <MiniKpi titulo="Resolvidas" valor={statusEntrega("Finalizado")} icone="✅" cor="#16a34a" detalhe="Somente entrega" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "20px" }}>
        <GraficoRosca titulo="Motivos — Falha de Peça" dados={motivosPeca} />
        <RankingGenerico titulo="Ranking de motivos" dados={motivosPeca} cor="#7c3aed" />
        <GraficoHorizontal titulo="Transportadoras com falhas" dados={transportadoras} cor="#2563eb" />
        <RankingProdutos dados={produtos} />
      </div>
    </>
  );
}

function MiniKpi({
  titulo,
  valor,
  icone,
  cor,
  detalhe
}: {
  titulo: string;
  valor: number | string;
  icone: string;
  cor: string;
  detalhe?: string;
}) {
  return (
    <article style={{ ...miniCardStyle, borderTop: `5px solid ${cor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
        <div>
          <div style={{ color: "#64748b", fontSize: "13px", fontWeight: 700 }}>{titulo}</div>
          <strong style={{ display: "block", marginTop: "5px", color: cor, fontSize: "31px" }}>{valor}</strong>
        </div>
        <span style={{ fontSize: "28px" }}>{icone}</span>
      </div>
      {detalhe && <div style={{ marginTop: "7px", color: "#94a3b8", fontSize: "11px" }}>{detalhe}</div>}
    </article>
  );
}

function GraficoVertical({ titulo, dados, cor }: { titulo: string; dados: Array<[string, number]>; cor: string }) {
  const maior = Math.max(...dados.map(([, valor]) => valor), 1);
  return (
    <article style={miniCardStyle}>
      <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: 800 }}>{titulo}</h3>
      {dados.length === 0 ? (
        <p style={{ marginTop: "18px", color: "#64748b" }}>Sem dados no período.</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: "18px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", minWidth: `${Math.max(dados.length * 90, 470)}px`, height: "285px", padding: "15px 8px 0", borderBottom: "1px solid #d1d5db", backgroundImage: "repeating-linear-gradient(to top, transparent 0, transparent 54px, #eef2f7 55px)" }}>
            {dados.map(([nome, valor]) => (
              <div key={nome} title={`${nome}: ${valor}`} style={{ flex: 1, minWidth: "65px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                <strong style={{ marginBottom: "6px", color: cor, fontSize: "13px" }}>{valor}</strong>
                <div style={{ width: "48px", height: `${valor ? Math.max((valor / maior) * 185, 12) : 3}px`, borderRadius: "8px 8px 2px 2px", background: `linear-gradient(180deg, ${cor}99, ${cor})` }} />
                <span style={{ width: "82px", minHeight: "46px", marginTop: "7px", color: "#475569", fontSize: "10px", fontWeight: 600, lineHeight: 1.2, textAlign: "center" }}>{nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function GraficoHorizontal({ titulo, dados, cor }: { titulo: string; dados: Array<[string, number]>; cor: string }) {
  const maior = Math.max(...dados.map(([, valor]) => valor), 1);
  return (
    <article style={miniCardStyle}>
      <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: 800 }}>{titulo}</h3>
      {dados.length === 0 ? (
        <p style={{ marginTop: "18px", color: "#64748b" }}>Sem dados no período.</p>
      ) : (
        <div style={{ display: "grid", gap: "13px", marginTop: "18px" }}>
          {dados.map(([nome, valor]) => (
            <div key={nome}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "5px", color: "#475569", fontSize: "12px" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</span>
                <strong>{valor}</strong>
              </div>
              <div style={{ height: "11px", borderRadius: "999px", background: "#e5e7eb", overflow: "hidden" }}>
                <div style={{ width: `${valor ? Math.max((valor / maior) * 100, 3) : 0}%`, height: "100%", borderRadius: "999px", background: cor }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

const coresGraficos = [
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#0ea5e9",
  "#db2777",
  "#64748b"
];

function criarGradienteCircular(dados: Array<[string, number]>) {
  const total = dados.reduce((soma, [, valor]) => soma + valor, 0);
  if (!total) return { total: 0, fundo: "#e5e7eb" };

  let acumulado = 0;
  const partes = dados.map(([, valor], index) => {
    const inicio = (acumulado / total) * 100;
    acumulado += valor;
    const fim = (acumulado / total) * 100;
    return `${coresGraficos[index % coresGraficos.length]} ${inicio}% ${fim}%`;
  });

  return { total, fundo: `conic-gradient(${partes.join(", ")})` };
}

function GraficoPizza({ titulo, dados }: { titulo: string; dados: Array<[string, number]> }) {
  return <GraficoCircular titulo={titulo} dados={dados} rosca={false} />;
}

function GraficoRosca({ titulo, dados }: { titulo: string; dados: Array<[string, number]> }) {
  return <GraficoCircular titulo={titulo} dados={dados} rosca />;
}

function GraficoCircular({
  titulo,
  dados,
  rosca
}: {
  titulo: string;
  dados: Array<[string, number]>;
  rosca: boolean;
}) {
  const { total, fundo } = criarGradienteCircular(dados);

  return (
    <article style={miniCardStyle}>
      <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: 800 }}>{titulo}</h3>
      {dados.length === 0 || total === 0 ? (
        <p style={{ marginTop: "18px", color: "#64748b" }}>Sem dados no período.</p>
      ) : (
        <div style={{ minHeight: "260px", display: "flex", justifyContent: "center", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
          <div
            role="img"
            aria-label={`${titulo}: total ${total}`}
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: fundo,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 7px 18px rgba(15, 23, 42, 0.12)"
            }}
          >
            {rosca && (
              <div style={{ width: "98px", height: "98px", borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", textAlign: "center" }}>
                <div><strong style={{ display: "block", fontSize: "25px" }}>{total}</strong><span style={{ color: "#64748b", fontSize: "10px" }}>registros</span></div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: "10px", minWidth: "170px" }}>
            {dados.map(([nome, valor], index) => {
              const percentual = total ? (valor / total) * 100 : 0;
              return (
                <div key={nome} style={{ display: "grid", gridTemplateColumns: "12px 1fr auto", alignItems: "center", gap: "8px", color: "#475569", fontSize: "12px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: coresGraficos[index % coresGraficos.length] }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</span>
                  <strong>{valor} ({percentual.toFixed(1)}%)</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

function RankingGenerico({ titulo, dados, cor }: { titulo: string; dados: Array<[string, number]>; cor: string }) {
  return (
    <article style={miniCardStyle}>
      <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: 800 }}>{titulo}</h3>
      {dados.length === 0 ? (
        <p style={{ marginTop: "18px", color: "#64748b" }}>Sem dados no período.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
          {dados.map(([nome, valor], index) => (
            <div key={nome} style={{ display: "grid", gridTemplateColumns: "34px 1fr auto", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: index < 3 ? "#f5f3ff" : "#f8fafc" }}>
              <strong style={{ color: index === 0 ? cor : "#64748b", fontSize: "17px" }}>#{index + 1}</strong>
              <span style={{ color: "#374151", fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</span>
              <strong style={{ color: cor }}>{valor}</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function agruparEvolucaoDiaria(registros: any[]) {
  const totais = registros.reduce<Record<string, { valor: number; operadores: Set<string> }>>((acc, item) => {
    const data = String(item.dataEntrada || item.data_entrada || item.data || "").slice(0, 10);
    if (!data) return acc;
    if (!acc[data]) {
      acc[data] = { valor: 0, operadores: new Set<string>() };
    }
    acc[data].valor += Number(item.quantidade || 0);
    const operador = String(item.responsavel || item.operador || "Não informado");
    acc[data].operadores.add(operador);
    return acc;
  }, {});

  return Object.entries(totais)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([data, item]) => ({
      data,
      valor: item.valor,
      operadores: Array.from(item.operadores)
    }));
}

function GraficoLinhaDiaria({
  titulo,
  dados
}: {
  titulo: string;
  dados: Array<{ data: string; valor: number; operadores: string[] }>;
}) {
  const largura = 760;
  const altura = 280;
  const margem = 55;
  const base = 215;
  const topo = 25;
  const maior = Math.max(...dados.map((item) => item.valor), 1);
  const intervalo = dados.length > 1 ? (largura - margem * 2) / (dados.length - 1) : 0;
  const pontos = dados.map((item, index) => ({
    data: item.data,
    valor: item.valor,
    operadores: item.operadores,
    x: dados.length === 1 ? largura / 2 : margem + index * intervalo,
    y: base - (item.valor / maior) * (base - topo)
  }));

  return (
    <article style={miniCardStyle}>
      <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: 800 }}>{titulo}</h3>
      {dados.length === 0 ? (
        <p style={{ marginTop: "18px", color: "#64748b" }}>Sem datas disponíveis no período.</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: "12px" }}>
          <svg viewBox={`0 0 ${largura} ${altura}`} style={{ width: "100%", minWidth: "680px", height: "300px" }} role="img" aria-label={titulo}>
            {[0, 1, 2, 3, 4].map((linha) => {
              const y = topo + ((base - topo) / 4) * linha;
              return <line key={linha} x1={margem} x2={largura - margem} y1={y} y2={y} stroke="#e5e7eb" />;
            })}
            {pontos.length > 1 && <polyline points={pontos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />}
            {pontos.map((ponto) => (
              <g key={ponto.data}>
                <circle cx={ponto.x} cy={ponto.y} r="7" fill="#fff" stroke="#7c3aed" strokeWidth="4" />
                <text x={ponto.x} y={ponto.y - 14} textAnchor="middle" fill="#4c1d95" fontSize="12" fontWeight="700">{ponto.valor}</text>
                <text x={ponto.x} y="243" textAnchor="middle" fill="#64748b" fontSize="10">{ponto.data.slice(8, 10)}/{ponto.data.slice(5, 7)}</text>
                <text x={ponto.x} y="260" textAnchor="middle" fill="#7c3aed" fontSize="9" fontWeight="600">
                  {ponto.operadores.join(", ").length > 18
                    ? `${ponto.operadores.join(", ").slice(0, 17)}…`
                    : ponto.operadores.join(", ")}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </article>
  );
}

function GraficoDonutMarketplace({ comErro, semErro }: { comErro: number; semErro: number }) {
  const total = comErro + semErro;
  const percentualErro = total ? (comErro / total) * 100 : 0;
  const fundo = total
    ? `conic-gradient(#dc2626 0 ${percentualErro}%, #16a34a ${percentualErro}% 100%)`
    : "#e5e7eb";

  return (
    <article style={miniCardStyle}>
      <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: 800 }}>Com erro × Sem erro</h3>
      <div style={{ minHeight: "245px", display: "flex", justifyContent: "center", alignItems: "center", gap: "30px", flexWrap: "wrap" }}>
        <div style={{ width: "170px", height: "170px", borderRadius: "50%", background: fundo, display: "grid", placeItems: "center" }}>
          <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", textAlign: "center" }}>
            <div><strong style={{ display: "block", fontSize: "25px" }}>{total}</strong><span style={{ color: "#64748b", fontSize: "10px" }}>registros</span></div>
          </div>
        </div>
        <div style={{ display: "grid", gap: "13px" }}>
          <Legenda cor="#dc2626" nome="Com erro" valor={comErro} />
          <Legenda cor="#16a34a" nome="Sem erro" valor={semErro} />
        </div>
      </div>
    </article>
  );
}

function Legenda({ cor, nome, valor }: { cor: string; nome: string; valor: number }) {
  return <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "13px" }}><span style={{ width: "12px", height: "12px", borderRadius: "50%", background: cor }} /><span>{nome}</span><strong>{valor}</strong></div>;
}

function agruparTransportadoras(registros: any[]) {
  const totais = registros.reduce<Record<string, number>>((acc, item) => {
    const observacao = String(item.observacao || "");
    const transportadora = item.transportadora || observacao.match(/Transportadora:\s*([^|]+)/i)?.[1]?.trim() || "Não informada";
    acc[transportadora] = (acc[transportadora] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(totais).sort((a, b) => b[1] - a[1]);
}

function agruparProdutos(registros: any[]) {
  const totais = registros.reduce<Record<string, number>>((acc, item) => {
    const nome = item.produto || item.sku || "Não informado";
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(totais).sort((a, b) => b[1] - a[1]);
}

function RankingProdutos({ dados }: { dados: Array<[string, number]> }) {
  return (
    <article style={miniCardStyle}>
      <h3 style={{ color: "#1f2937", fontSize: "18px", fontWeight: 800 }}>Falhas por produto</h3>
      {dados.length === 0 ? (
        <p style={{ marginTop: "18px", color: "#64748b" }}>Sem produtos no período.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
          {dados.map(([nome, valor], index) => (
            <div key={nome} style={{ display: "grid", gridTemplateColumns: "34px 1fr auto", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: index < 3 ? "#f5f3ff" : "#f8fafc" }}>
              <strong style={{ color: index === 0 ? "#7c3aed" : "#64748b", fontSize: "17px" }}>#{index + 1}</strong>
              <span style={{ color: "#374151", fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</span>
              <strong style={{ color: "#dc2626" }}>{valor}</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
