import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />

      <main
        className="min-h-screen min-w-0 p-6"
        style={{ marginLeft: "18rem", width: "calc(100% - 18rem)" }}
      >
        <Outlet />
      </main>

    </div>
  )
}

export default Layout
