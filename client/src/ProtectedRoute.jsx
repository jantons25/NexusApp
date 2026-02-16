import { useAuth } from './context/AuthContext.jsx'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {

  const {loading, isAuthenticated} =  useAuth()
  if (loading) return <div className="bg-zinc-800 w-full h-screen flex justify-center items-center"><h1 className="text-white text-2xl">Loading...</h1></div>
  if(!loading && !isAuthenticated) return <Navigate to="/login" replace/>

  return <Outlet />
}

export default ProtectedRoute