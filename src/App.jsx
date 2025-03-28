import { BrowserRouter } from "react-router-dom";
import Dashboard from "../src/components/dashBoard/Dashbord";
// import Dashboard  from "./Sale/ByReport/Bypayment"
// import Dashboard from "./A";

function App() {
  return (
    <BrowserRouter >
      <Dashboard />
    </BrowserRouter>
  );
}

export default App;
