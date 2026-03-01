import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Playground from './pages/Playground/Playground';
import './styles/main.scss';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playground/:assignmentId" element={<Playground />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
