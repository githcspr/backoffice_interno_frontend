import { Routes, Route, Navigate } from "react-router-dom";
import LoginView from "../views/auth/LoginView";
import Home from "../views/home/Home";
import PrivateRoute from "./PrivateRoute";
import PrivateLayout from "../layouts/PrivateLayout";
import { useAuth } from "../controller/features/auth/AuthContext";
import Profile from "../views/user/Profile";
import InsuranceMaster from "../views/insuranceMaster/InsuranceMaster";
import ResultsMaster from "../views/resultsMaster/ResultsMaster";

const RouterComponent = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Pública */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginView />}
            />

            {/* Privadas con layout */}
            <Route
                element={
                    <PrivateRoute>
                        <PrivateLayout />
                    </PrivateRoute>
                }
            >
                <Route path="/home" element={<Home />} />
                {/* acá van todas las privadas */}
                <Route path="/perfil" element={<Profile />} />
                <Route path="/insuranceMaster" element={<InsuranceMaster />} />
                <Route path="/resultsMaster" element={<ResultsMaster />} />
            </Route>

            {/* Root */}
            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
            />

            {/* Fallback */}
            <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
            />
        </Routes>
    );
};

export default RouterComponent;
