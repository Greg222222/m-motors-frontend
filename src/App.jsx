import { Link, Routes, Route } from 'react-router-dom'
import Catalogue from './pages/Catalogue'

function App() {
  return (
    <>
      <nav>
        <Link to="/">Catalogue</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Catalogue />} />
        </Routes>
      </main>
    </>
  )
}

export default App
