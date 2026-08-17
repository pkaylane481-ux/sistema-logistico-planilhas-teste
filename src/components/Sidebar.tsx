import { Link, useLocation } from "react-router-dom";

function Sidebar() {

  const location = useLocation();

  const menu = [
    {
      nome: "Dashboard",
      rota: "/dashboard",
      icone: "📊",
    },
    {
      nome: "Devolução Logística",
      rota: "/devolucao-logistica",
      icone: "📦",
    },
    {
      nome: "Trocas e Devoluções",
      rota: "/trocas",
      icone: "🔄",
    },
    {
      nome: "Pedidos Prioridade",
      rota: "/pedidos-prioridade",
      icone: "⭐",
    },
    {
      nome: "Produtividade",
      rota: "/produtividade",
      icone: "📈",
    },
    {
      nome: "SLA",
      rota: "/sla",
      icone: "⏱️",
    },
    {
      nome: "Configurações",
      rota: "/configuracoes",
      icone: "⚙️",
    },
  ];

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 w-72 h-screen bg-purple-950 shadow-lg overflow-y-auto"
      style={{ width: "18rem" }}
    >

      <div className="p-6 border-b border-purple-800">

        <h1 className="text-2xl font-bold text-white">
          Pangeia 96
        </h1>

        <p className="text-purple-300 text-sm mt-1">
          Sistema de Gestão Logística
        </p>

      </div>

      <nav className="p-4 pb-24 flex flex-col gap-2">

        {menu.map((item) => (

          <Link
            key={item.rota}
            to={item.rota}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.rota
                ? "bg-purple-700 text-white"
                : "text-purple-100 hover:bg-purple-800"
            }`}
          >
            <span className="text-xl">
              {item.icone}
            </span>

            <span className="font-medium">
              {item.nome}
            </span>

          </Link>

        ))}

      </nav>

      <div className="fixed bottom-6 left-6 text-xs text-purple-400">
        Versão 1.0.0
      </div>

    </aside>
  );
}

export default Sidebar;
