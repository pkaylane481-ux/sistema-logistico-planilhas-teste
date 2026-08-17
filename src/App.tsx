import { HashRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import DevolucaoLogistica from "./pages/DevolucaoLogistica";
import TrocasDevolucoes from "./pages/TrocasDevolucoes";
import PedidosPrioridade from "./pages/PedidosPrioridade";
import Produtividade from "./pages/Produtividade";
import SLA from "./pages/SLA";
import Configuracoes from "./pages/Configuracoes";

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100">
        <Sidebar />

        <main
          className="min-h-screen min-w-0 p-8"
          style={{ marginLeft: "18rem", width: "calc(100% - 18rem)" }}
        >
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Devolução Logística */}
            <Route
              path="/devolucao-logistica"
              element={<DevolucaoLogistica />}
            />

            {/* Trocas e Devoluções */}
            <Route
              path="/trocas"
              element={<TrocasDevolucoes />}
            />

            {/* Pedidos de Prioridade */}
            <Route
              path="/pedidos-prioridade"
              element={<PedidosPrioridade />}
            />

            {/* Produtividade */}
            <Route
              path="/produtividade"
              element={<Produtividade />}
            />

            {/* SLA */}
            <Route
              path="/sla"
              element={<SLA />}
            />

            {/* Configurações */}
            <Route
              path="/configuracoes"
              element={<Configuracoes />}
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
