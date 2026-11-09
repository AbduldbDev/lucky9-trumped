import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { IntroProvider } from "./contexts/IntroContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <IntroProvider>
          <AppRoutes />
        </IntroProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
