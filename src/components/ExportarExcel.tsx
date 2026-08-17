import * as XLSX from "xlsx";


interface Coluna {

  campo: string;

  titulo: string;

}



interface Props {


  dados: any[];

  nomeArquivo: string;

  titulo?: string;

  nomeAba?: string;

  colunas?: Coluna[];


}



export default function ExportarExcel({


  dados,

  nomeArquivo,

  titulo = "Exportar Excel",

  nomeAba = "Dados",

  colunas


}: Props){





function exportar(){



  if(!dados || dados.length === 0){


    alert("Não existem dados para exportar.");

    return;


  }





  let dadosTratados = dados;





  // ==========================
  // FORMATAR COLUNAS
  // ==========================


  if(colunas && colunas.length > 0){



    dadosTratados = dados.map(item => {



      const novoObjeto:any = {};




      colunas.forEach(coluna => {



        novoObjeto[coluna.titulo] =

          item[coluna.campo] ?? "";



      });




      return novoObjeto;



    });



  }






  // ==========================
  // CRIAR PLANILHA
  // ==========================


  const planilha =

    XLSX.utils.json_to_sheet(

      dadosTratados

    );






  // ==========================
  // AJUSTAR LARGURA COLUNAS
  // ==========================


  const largura =

    Object.keys(

      dadosTratados[0]

    ).map(()=>({


      wch:20


    }));




  planilha["!cols"] = largura;






  // ==========================
  // CRIAR ARQUIVO
  // ==========================


  const arquivo =

    XLSX.utils.book_new();





  XLSX.utils.book_append_sheet(


    arquivo,


    planilha,


    nomeAba


  );







  XLSX.writeFile(


    arquivo,


    `${nomeArquivo}.xlsx`


  );



}







return(



<button


onClick={exportar}


style={{


padding:"10px 18px",

background:"#7c3aed",

color:"#fff",

border:"none",

borderRadius:"10px",

cursor:"pointer",

fontWeight:"bold"


}}



>


📊 {titulo}



</button>



);


}