import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/auth";
import { Dashboard } from "./pages/dashboard";
import { Clients, AddEditClient } from "./pages/clients";
import { Users, AddEditUser } from "./pages/users";
import { Lawsuits, AddEditLawsuit } from "./pages/lawsuits";
import { Cases } from "./pages/cases";
import { Documents } from "./pages/documents";
import { Calendar } from "./pages/calendar";
import { Reports } from "./pages/reports";
import {
	Settings,
	MonProfil,
	Entreprise,
	Court,
	LawsuitStage,
	TypeLawsuit,
} from "./pages/settings";
import { useApp } from "./hooks";

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 1000 * 60 * 5, // 5 minutes
			refetchOnWindowFocus: false,
		},
	},
});

const AppContent = () => {
	const { theme, language, isRTL } = useApp();

	const getAntdTheme = () => {
		const baseTheme = {
			token: {
				colorPrimary:
					theme === "blue"
						? "#1890ff"
						: theme === "green"
						? "#52c41a"
						: theme === "purple"
						? "#722ed1"
						: "#1890ff",
				borderRadius: 8,
				fontFamily: "system-ui, -apple-system, sans-serif",
			},
		};

		if (theme === "dark") {
			return {
				...baseTheme,
				algorithm: antdTheme.darkAlgorithm,
				token: {
					...baseTheme.token,
					colorBgContainer: "#141414",
					colorBgElevated: "#1f1f1f",
				},
			};
		}

		return baseTheme;
	};

	return (
		<ConfigProvider
			theme={getAntdTheme()}
			direction={isRTL ? "rtl" : "ltr"}
			locale={language === "ar" ? undefined : undefined}
		>
			<AntdApp>
				<Router>
					<Routes>
						{/* Public route - login page */}
						<Route
							path='/login'
							element={
								<ProtectedRoute requireAuth={false}>
									<Login />
								</ProtectedRoute>
							}
						/>

						{/* Protected routes - require authentication */}
						<Route
							path='/*'
							element={
								<ProtectedRoute>
									<Layout>
										<Routes>
											<Route path='/' element={<Dashboard />} />
											<Route path='/clients' element={<Clients />} />
											<Route path='/clients/add' element={<AddEditClient />} />
											<Route path='/clients/:id/edit' element={<AddEditClient />} />
											<Route path='/users' element={<Users />} />
											<Route path='/users/add' element={<AddEditUser />} />
											<Route path='/users/:id/edit' element={<AddEditUser />} />
											<Route path='/lawsuits' element={<Lawsuits />} />
											<Route path='/lawsuits/add' element={<AddEditLawsuit />} />
											<Route path='/lawsuits/:id/edit' element={<AddEditLawsuit />} />
											<Route path='/cases' element={<Cases />} />
											<Route path='/documents' element={<Documents />} />
											<Route path='/calendar' element={<Calendar />} />
											<Route path='/reports' element={<Reports />} />
											<Route path='/settings' element={<Settings />}>
												<Route index element={<MonProfil />} />
												<Route path='mon-profil' element={<MonProfil />} />
												<Route path='entreprise' element={<Entreprise />} />
												<Route path='court' element={<Court />} />
												<Route path='lawsuit-stage' element={<LawsuitStage />} />
												<Route path='type-lawsuit' element={<TypeLawsuit />} />
											</Route>
										</Routes>
									</Layout>
								</ProtectedRoute>
							}
						/>
					</Routes>
				</Router>
			</AntdApp>
		</ConfigProvider>
	);
};

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AppProvider>
				<AuthProvider>
					<AppContent />
				</AuthProvider>
			</AppProvider>
		</QueryClientProvider>
	);
}

export default App;
