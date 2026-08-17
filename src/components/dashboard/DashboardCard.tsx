import type { ReactNode } from "react";

interface DashboardCardProps {

  title: string;

  subtitle?: string;

  icon?: ReactNode;

  action?: ReactNode;

  children: ReactNode;

  className?: string;

}

export default function DashboardCard({

  title,

  subtitle,

  icon,

  action,

  children,

  className = ""

}: DashboardCardProps) {

  return (

    <section
      className={`
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-gray-200
        overflow-hidden
        ${className}
      `}
    >

      {/* HEADER */}

      <header className="px-6 py-5 border-b border-gray-100">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            {icon && (

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-purple-100
                  flex
                  items-center
                  justify-center
                  text-purple-700
                "
              >

                {icon}

              </div>

            )}

            <div>

              <h2 className="text-lg font-semibold text-gray-800">

                {title}

              </h2>

              {subtitle && (

                <p className="text-sm text-gray-500">

                  {subtitle}

                </p>

              )}

            </div>

          </div>

          {action}

        </div>

      </header>

      {/* BODY */}

      <div className="p-6">

        {children}

      </div>

    </section>

  );

}