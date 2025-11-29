import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProtectedModuleRoute } from "./components/ProtectedModuleRoute";
import { Login } from "./pages/auth";
import { Dashboard } from "./pages/dashboard";
import { Clients, ClientDetails, AddEditClient } from "./pages/clients";
import { Users, AddEditUser } from "./pages/users";
import { Lawsuits, AddEditLawsuit } from "./pages/lawsuits";
import { ClientPayments, AddEditClientPayment, ClientPaymentDetail } from "./pages/payments";
import { Folders } from "./pages/folders";
import { Events } from "./pages/events/Events";
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
											{/* Dashboard */}
											<Route
												path='/'
												element={
													<ProtectedModuleRoute module='dashboard'>
														<Dashboard />
													</ProtectedModuleRoute>
												}
											/>

											{/* Clients */}
											<Route
												path='/clients'
												element={
													<ProtectedModuleRoute module='clients'>
														<Clients />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/clients/add'
												element={
													<ProtectedModuleRoute module='clients' writeOnly>
														<AddEditClient />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/clients/:id/edit'
												element={
													<ProtectedModuleRoute module='clients' writeOnly>
														<AddEditClient />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/clients/:id'
												element={
													<ProtectedModuleRoute module='clients'>
														<ClientDetails />
													</ProtectedModuleRoute>
												}
											/>

											{/* Users */}
											<Route
												path='/users'
												element={
													<ProtectedModuleRoute module='users'>
														<Users />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/users/add'
												element={
													<ProtectedModuleRoute module='users' writeOnly>
														<AddEditUser />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/users/:id/edit'
												element={
													<ProtectedModuleRoute module='users' writeOnly>
														<AddEditUser />
													</ProtectedModuleRoute>
												}
											/>

											{/* Lawsuits */}
											<Route
												path='/lawsuits'
												element={
													<ProtectedModuleRoute module='lawsuits'>
														<Lawsuits />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/lawsuits/add'
												element={
													<ProtectedModuleRoute module='lawsuits' writeOnly>
														<AddEditLawsuit />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/lawsuits/:id/edit'
												element={
													<ProtectedModuleRoute module='lawsuits' writeOnly>
														<AddEditLawsuit />
													</ProtectedModuleRoute>
												}
											/>

											{/* Payments */}
											<Route
												path='/payments'
												element={
													<ProtectedModuleRoute module='payments'>
														<ClientPayments />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/payments/add'
												element={
													<ProtectedModuleRoute module='payments' writeOnly>
														<AddEditClientPayment />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/payments/:id'
												element={
													<ProtectedModuleRoute module='payments'>
														<ClientPaymentDetail />
													</ProtectedModuleRoute>
												}
											/>
											<Route
												path='/payments/:id/edit'
												element={
													<ProtectedModuleRoute module='payments' writeOnly>
														<AddEditClientPayment />
													</ProtectedModuleRoute>
												}
											/>

											{/* Folders */}
											<Route
												path='/folders'
												element={
													<ProtectedModuleRoute module='folders'>
														<Folders />
													</ProtectedModuleRoute>
												}
											/>

											{/* Events */}
											<Route
												path='/events'
												element={
													<ProtectedModuleRoute module='events'>
														<Events />
													</ProtectedModuleRoute>
												}
											/>

											{/* Settings */}
											<Route path='/settings' element={<Settings />}>
												<Route index element={<MonProfil />} />
												<Route path='mon-profil' element={<MonProfil />} />
												<Route path='entreprise' element={<Entreprise />} />
												<Route
													path='court'
													element={
														<ProtectedModuleRoute module='courts'>
															<Court />
														</ProtectedModuleRoute>
													}
												/>
												<Route
													path='lawsuit-stage'
													element={
														<ProtectedModuleRoute module='lawsuitStages'>
															<LawsuitStage />
														</ProtectedModuleRoute>
													}
												/>
												<Route
													path='type-lawsuit'
													element={
														<ProtectedModuleRoute module='lawsuitTypes'>
															<TypeLawsuit />
														</ProtectedModuleRoute>
													}
												/>
											</Route>

											{/* Catch-all route - redirect any non-existent path to dashboard */}
											<Route path='*' element={<Navigate to='/' replace />} />
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
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<AppProvider>
					<AuthProvider>
						<AppContent />
					</AuthProvider>
				</AppProvider>
			</QueryClientProvider>
		</ErrorBoundary>
	);
}

export default App;
