import { useMemo } from "react";

interface Props {
  devolucoesLogistica: any[];
  prioridades: any[];
  slas: any[];
}

export default function AlertsPanel({
  devolucoesLogistica,
  prioridades,
  slas,
}: Props) {

  const indicadores = useMemo(() => {

    const aguardandoCliente =
      devolucoesLogistica.filter(
        item => item.status === "Aguardando cliente"
      ).length;

    const emContato =
      devolucoesLogistica.filter(
        item => item.status === "Em contato"
      ).length;

    const reenvios =
      devolucoesLogistica.filter(
        item =>
          String(item.destino ?? "")
            .toLowerCase()
            .includes("reenvio")
      ).length;

    const prioridadesAbertas =
      prioridades.filter(
        item =>
          item.status !== "Concluído" &&
          item.status !== "Resolvido"
      ).length;

    const slaVencido =
      slas.filter(
        item => item.status === "Fora do SLA"
      ).length;

    return {
      aguardandoCliente,
      emContato,
      reenvios,
      prioridadesAbertas,
      slaVencido,
    };

  }, [
    devolucoesLogistica,
    prioridades,
    slas,
  ]);

  const Item = ({
    titulo,
    valor,
    cor,
  }: {
    titulo: string;
    valor: number;
    cor: string;
  }) => (

    <div className="flex justify-between items-center border-b py-3 last:border-0">

      <span className="font-medium text-gray-700">
        {titulo}
      </span>

      <span
        className="font-bold text-xl"
        style={{ color: cor }}
      >
        {valor}
      </span>

    </div>

  );

  return (

    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Alertas Operacionais
      </h2>

      <Item
        titulo="Pedidos Prioridade em aberto"
        valor={indicadores.prioridadesAbertas}
        cor="#dc2626"
      />

      <Item
        titulo="SLAs fora do prazo"
        valor={indicadores.slaVencido}
        cor="#ef4444"
      />

      <Item
        titulo="Aguardando cliente"
        valor={indicadores.aguardandoCliente}
        cor="#f59e0b"
      />

      <Item
        titulo="Em contato com cliente"
        valor={indicadores.emContato}
        cor="#2563eb"
      />

      <Item
        titulo="Devoluções para reenvio"
        valor={indicadores.reenvios}
        cor="#16a34a"
      />

    </div>

  );
}