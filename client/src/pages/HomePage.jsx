import MaquetaHtml from "../components/MaquetaHtml"
import { useAuth } from '../context/AuthContext.jsx'

function HomePage() {

  const {user} = useAuth();

  return (
    <div>
      <MaquetaHtml user={user}>
      </MaquetaHtml>
    </div>
  )
}

export default HomePage