interface CardKPIProps {
  titulo: string
  valor: number
  icone: string
}

function CardKPI({ titulo, valor, icone }: CardKPIProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-500 text-sm">
            {titulo}
          </p>

          <h2 className="text-3xl font-bold text-purple-900">
            {valor}
          </h2>
        </div>

        <span className="text-3xl">
          {icone}
        </span>

      </div>

    </div>
  )
}

export default CardKPI