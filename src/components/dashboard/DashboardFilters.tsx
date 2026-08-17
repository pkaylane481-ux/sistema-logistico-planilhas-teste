import type {
  Operador,
  Marketplace,
  Transportadora
} from "../../types";

import {
  RefreshCw,
  Search
} from "lucide-react";

interface DashboardFiltersProps {
  dataInicial: string;
setDataInicial: (valor: string) => void;

dataFinal: string;
setDataFinal: (valor: string) => void;

  operador: string;
  setOperador: (valor: string) => void;

  marketplace: string;
  setMarketplace: (valor: string) => void;

  transportadora: string;
  setTransportadora: (valor: string) => void;

  tipo: string;
  setTipo: (valor: string) => void;

  status: string;
  setStatus: (valor: string) => void;

  busca: string;
  setBusca: (valor: string) => void;

  operadores: Operador[];
  marketplaces: Marketplace[];
  transportadoras: Transportadora[];

  atualizar?: () => void;
}

export default function DashboardFilters({

  dataInicial,
setDataInicial,

dataFinal,
setDataFinal,

  operador,
  setOperador,

  marketplace,
  setMarketplace,

  transportadora,
  setTransportadora,

  tipo,
  setTipo,

  status,
  setStatus,

  busca,
  setBusca,

  operadores,
  marketplaces,
  transportadoras,

  atualizar

}: DashboardFiltersProps) {

  function limparFiltros() {

    setDataInicial("");
setDataFinal("");

    setOperador("Todos");

    setMarketplace("Todos");

    setTransportadora("Todas");

    setTipo("Todos");

    setStatus("Todos");

    setBusca("");

  }

  return (

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-lg font-bold text-gray-800">
            Filtros do Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Refine os indicadores exibidos abaixo
          </p>

        </div>

        <button
  onClick={atualizar}
  style={{ backgroundColor: "#6d28d9", color: "#ffffff" }}
  className="flex items-center gap-2 px-4 py-2 rounded-lg"
>
  <RefreshCw size={18} color="#ffffff" />
  <span style={{ color: "#ffffff" }}>Atualizar</span>
</button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* PERÍODO */}

        <Campo titulo="Data Inicial">
  <input
    type="date"
    value={dataInicial}
    onChange={(e) => setDataInicial(e.target.value)}
    className={input}
  />
</Campo>

<Campo titulo="Data Final">
  <input
    type="date"
    value={dataFinal}
    onChange={(e) => setDataFinal(e.target.value)}
    className={input}
  />
</Campo>

        {/* OPERADOR */}

        <Campo titulo="Operador">

          <select
            value={operador}
            onChange={(e) => setOperador(e.target.value)}
            className={input}
          >

            <option>Todos</option>

            {operadores.map((item) => (

              <option
                key={item.id}
                value={item.nome}
              >

                {item.nome}

              </option>

            ))}

          </select>

        </Campo>

        {/* MARKETPLACE */}

        <Campo titulo="Marketplace">

          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className={input}
          >

            <option>Todos</option>

            {marketplaces.map((item) => (

              <option
                key={item.id}
                value={item.nome}
              >

                {item.nome}

              </option>

            ))}

          </select>

        </Campo>

        {/* TRANSPORTADORA */}

        <Campo titulo="Transportadora">

          <select
            value={transportadora}
            onChange={(e) => setTransportadora(e.target.value)}
            className={input}
          >

            <option>Todas</option>

            {transportadoras.map((item) => (

              <option
                key={item.id}
                value={item.nome}
              >

                {item.nome}

              </option>

            ))}

          </select>

        </Campo>

        {/* TIPO */}

        <Campo titulo="Tipo de Processo">

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={input}
          >

            <option>Todos</option>
            <option>Troca</option>
            <option>Devolução Logística</option>
            <option>Marketplace</option>
            <option>Prioridade</option>
            <option>Falha</option>
            <option>Produtividade</option>

          </select>

        </Campo>

        {/* STATUS */}

        <Campo titulo="Status">

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={input}
          >

            <option>Todos</option>
            <option>Em andamento</option>
            <option>Pendente</option>
            <option>Concluído</option>
            <option>Finalizado</option>
            <option>Fora do SLA</option>

          </select>

        </Campo>

        {/* BUSCA */}

        <div className="xl:col-span-2">

          <label className="block text-sm font-medium text-gray-600 mb-2">

            Busca rápida

          </label>

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pedido, cliente, CPF, rastreio, NF..."
              className={`${input} pl-10`}
            />

          </div>

        </div>

      </div>

      <div className="flex justify-end mt-6">

       <button
  onClick={limparFiltros}
  style={{
    background: "red",
    color: "white",
    padding: "10px 20px"
  }}
>
  Limpar filtros
</button>

      </div>

    </div>

  );

}

interface CampoProps {
  titulo: string;
  children: React.ReactNode;
}

function Campo({
  titulo,
  children
}: CampoProps) {

  return (

    <div>

      <label className="block text-sm font-medium text-gray-600 mb-2">

        {titulo}

      </label>

      {children}

    </div>

  );

}

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500";
