import { useState } from "react";
import { useSistema } from "../../context/SistemaContext";


export default function SLA(){


const {

slas,

adicionarSLA,

removerSLA

}=useSistema() as any;




const [nome,setNome]=useState("");

const [prazo,setPrazo]=useState("");

const [status,setStatus]=useState("Ativo");





async function salvar(){


if(!nome || !prazo){

alert("Preencha o nome e o prazo do SLA");

return;

}



const novo = await adicionarSLA({

  processo:nome,

  prazo:Number(prazo),

  status

});
if(!novo){

  alert("Erro ao cadastrar SLA");

  return;

}


setNome("");

setPrazo("");

setStatus("Ativo");


}







return(


<div

style={{

padding:"25px"

}}

>


<h2>

Cadastro de SLA

</h2>







<div

style={{

background:"#fff",

padding:"20px",

borderRadius:"12px",

boxShadow:"0 3px 10px rgba(0,0,0,0.08)",

display:"flex",

flexDirection:"column",

gap:"12px",

maxWidth:"400px"

}}

>



<label>

Nome do SLA

</label>



<input

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

placeholder="Ex: Análise de devolução"

value={nome}

onChange={(e)=>

setNome(e.target.value)

}

/>





<label>

Prazo (dias)

</label>



<input

type="number"

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

placeholder="Ex: 4"

value={prazo}

onChange={(e)=>

setPrazo(e.target.value)

}

/>







<label>

Status

</label>




<select

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

value={status}

onChange={(e)=>

setStatus(e.target.value)

}

>


<option>

Ativo

</option>


<option>

Inativo

</option>


</select>







<button

style={{

marginTop:"10px",

padding:"12px",

background:"#8000ff",

color:"#fff",

border:"none",

borderRadius:"8px",

cursor:"pointer",

fontWeight:"bold"

}}

onClick={salvar}

>


Cadastrar SLA


</button>





</div>








<div

style={{

marginTop:"30px"

}}

>


<h3>

SLAs cadastrados

</h3>







<table

style={{

width:"100%",

borderCollapse:"collapse",

background:"#fff"

}}

>


<thead>

<tr>



<th

style={{

padding:"10px",

borderBottom:"1px solid #ddd"

}}

>

Nome / Prazo

</th>





<th

style={{

padding:"10px",

borderBottom:"1px solid #ddd"

}}

>

Data Cadastro

</th>





<th

style={{

padding:"10px",

borderBottom:"1px solid #ddd"

}}

>

Ação

</th>



</tr>


</thead>







<tbody>


{

(slas ?? []).map((item: any)=>(


<tr

key={item.id}

>


<td
  style={{
    padding:"10px"
  }}
>
  {item.processo} - {item.prazo} dias
</td>





<td

style={{

padding:"10px"

}}

>

{item.created_at
  ? new Date(item.created_at).toLocaleDateString("pt-BR")
  : "-"}

</td>





<td

style={{

padding:"10px"

}}

>



<button

style={{

background:"#e74c3c",

color:"#fff",

border:"none",

padding:"8px 12px",

borderRadius:"6px",

cursor:"pointer"

}}


onClick={()=>


removerSLA(item.id)


}


>

Excluir

</button>



</td>




</tr>


))


}






{

(slas ?? []).length===0 &&


<tr>


<td

colSpan={3}

style={{

padding:"15px",

textAlign:"center"

}}

>


Nenhum SLA cadastrado


</td>


</tr>


}





</tbody>


</table>





</div>







</div>


)


}
