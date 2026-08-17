interface PageFiltersProps {
  periodo?: string;
  operador?: string;
  transportadora?: string;
  status?: string;

  onPeriodoChange?: (valor: string) => void;
  onOperadorChange?: (valor: string) => void;
  onTransportadoraChange?: (valor: string) => void;
  onStatusChange?: (valor: string) => void;

  operadores?: string[];
  transportadoras?: string[];
  statusOptions?: string[];
}

export default function PageFilters({
  periodo = "Hoje",
  operador = "Todos",
  transportadora = "Todas",
  status = "Todos",

  onPeriodoChange,
  onOperadorChange,
  onTransportadoraChange,
  onStatusChange,

  operadores = [],
  transportadoras = [],
  statusOptions = [],
}: PageFiltersProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        bg-purple-950/40
        px-3
        py-2
        rounded-xl
      "
    >

      {/* PERÍODO */}
      <select
        value={periodo}
        onChange={(e) => onPeriodoChange?.(e.target.value)}
        className="
          px-3
          py-2
          rounded-lg
          bg-white
          text-purple-900
          text-sm
          font-medium
          outline-none
        "
      >
        <option>Hoje</option>
        <option>Semana</option>
        <option>Mês</option>
        <option>Personalizado</option>
      </select>


      {/* OPERADOR */}
      <select
        value={operador}
        onChange={(e) => onOperadorChange?.(e.target.value)}
        className="
          px-3
          py-2
          rounded-lg
          bg-white
          text-purple-900
          text-sm
          font-medium
          outline-none
        "
      >
        <option>Todos</option>

        {operadores.map((item) => (
          <option key={item}>
            {item}
          </option>
        ))}

      </select>


      {/* TRANSPORTADORA */}
      <select
        value={transportadora}
        onChange={(e) =>
          onTransportadoraChange?.(e.target.value)
        }
        className="
          px-3
          py-2
          rounded-lg
          bg-white
          text-purple-900
          text-sm
          font-medium
          outline-none
        "
      >
        <option>Todas</option>

        {transportadoras.map((item) => (
          <option key={item}>
            {item}
          </option>
        ))}

      </select>


      {/* STATUS */}
      <select
        value={status}
        onChange={(e) =>
          onStatusChange?.(e.target.value)
        }
        className="
          px-3
          py-2
          rounded-lg
          bg-white
          text-purple-900
          text-sm
          font-medium
          outline-none
        "
      >
        <option>Todos</option>

        {statusOptions.map((item) => (
          <option key={item}>
            {item}
          </option>
        ))}

      </select>

    </div>
  );
}
