import { useState } from "react";
import { useSistema } from "../context/SistemaContext";


export default function EntradaDados(){


const {

entradaDados,

adicionarEntrada,

removerEntrada,

transportadoras,

marketplaces

}=useSistema() as any;




const [pedido,setPedido]=useState("");

const [cliente,setCliente]=useState("");

const [tipo,setTipo]=useState("Devolução");

const [marketplace,setMarketplace]=useState("");

const [transportadora,setTransportadora]=useState("");

const [status,setStatus]=useState("Pendente");

const [observacao,setObservacao]=useState("");





function salvar(){


if(!pedido || !cliente){

alert("Preencha pedido e cliente");

return;

}



const novo={


id:Date.now(),

pedido,

cliente,

tipo,

marketplace,

transportadora,

status,

observacao,

dataEntrada:

new Date().toLocaleDateString()


};



adicionarEntrada(novo);



setPedido("");

setCliente("");

setTipo("Devolução");

setMarketplace("");

setTransportadora("");

setStatus("Pendente");

setObservacao("");



}






return(


<div

style={{

padding:"25px"

}}

>


<h2>

Entrada de Dados

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

maxWidth:"500px"

}}

>



<label>

Pedido

</label>


<input

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

placeholder="Número do pedido"

value={pedido}

onChange={(e)=>

setPedido(e.target.value)

}

/>





<label>

Cliente

</label>



<input

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

placeholder="Nome do cliente"

value={cliente}

onChange={(e)=>

setCliente(e.target.value)

}

/>





<label>

Tipo

</label>



<select

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

value={tipo}

onChange={(e)=>

setTipo(e.target.value)

}

>


<option>

Devolução

</option>


<option>

Troca

</option>


<option>

Reenvio

</option>


<option>

Prioridade

</option>


</select>






<label>

Marketplace

</label>



<select

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

value={marketplace}

onChange={(e)=>

setMarketplace(e.target.value)

}

>


<option value="">

Selecione

</option>


{

marketplaces.map((item: any)=>(

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

Transportadora

</label>



<select

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

value={transportadora}

onChange={(e)=>

setTransportadora(e.target.value)

}

>


<option value="">

Selecione

</option>


{

transportadoras.map((item: any)=>(

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

Pendente

</option>


<option>

Em análise

</option>


<option>

Finalizado

</option>


</select>







<label>

Observação

</label>



<textarea

style={{

padding:"10px",

border:"1px solid #ccc",

borderRadius:"8px"

}}

placeholder="Observações do processo"

value={observacao}

onChange={(e)=>

setObservacao(e.target.value)

}

/>







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

Cadastrar Processo

</button>




</div>







<div

style={{

marginTop:"30px"

}}

>


<h3>

Processos cadastrados

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


<th>
Pedido
</th>


<th>
Cliente
</th>


<th>
Tipo
</th>


<th>
Status
</th>


<th>
Data
</th>


<th>
Ação
</th>


</tr>


</thead>




<tbody>


{

entradaDados.map((item: any)=>(


<tr key={item.id}>


<td>
{item.pedido}
</td>


<td>
{item.cliente}
</td>


<td>
{item.tipo}
</td>


<td>
{item.status}
</td>


<td>
{item.dataEntrada}
</td>


<td>


<button

style={{

background:"#e74c3c",

color:"#fff",

border:"none",

padding:"8px 12px",

borderRadius:"6px"

}}


onClick={()=>


removerEntrada(item.id)


}

>

Excluir

</button>


</td>


</tr>


))


}



</tbody>


</table>



</div>



</div>


)

}
