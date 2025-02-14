import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './controllers/pages/Home';
import Admin from './controllers/pages/Admin';
import ActiveStartupsPage from './controllers/pages/ActiveStartups';
import StartupDetail from './controllers/pages/StartupDetail';
import AllStartups from './controllers/pages/AllStartups ';
import Checkout from './controllers/pages/Checkout';
import UserHistory from './controllers/pages/UserHistory';
function App() {
 
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/startups" element={<AllStartups  />} />
      <Route path="/activeStartups" element={<ActiveStartupsPage />} />
      <Route path="/startup/:regNo" element={<StartupDetail />} />
      <Route path="/user/:regNo" element={<UserHistory />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  </Router>
  );
}

export default App;
