import type { ReactNode } from "react";

interface Props {

  children: ReactNode;

  columns?: 2 | 3 | 4;

}

export default function DashboardGrid({

  children,

  columns = 2

}: Props) {

  const grid = {

    2: "grid-cols-1 xl:grid-cols-2",

    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",

    4: "grid-cols-2 xl:grid-cols-4"

  };

  return (

    <div className={`grid ${grid[columns]} gap-6`}>

      {children}

    </div>

  );

}