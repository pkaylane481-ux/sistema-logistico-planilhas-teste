import type { ReactNode } from "react";

interface Props {

  title: string;

  subtitle?: string;

  action?: ReactNode;

}

export default function DashboardSection({

  title,

  subtitle,

  action

}: Props) {

  return (

    <div className="flex items-center justify-between mb-5">

      <div>

        <h2 className="text-2xl font-bold text-gray-800">

          {title}

        </h2>

        {subtitle && (

          <p className="text-gray-500 mt-1">

            {subtitle}

          </p>

        )}

      </div>

      {action}

    </div>

  );

}