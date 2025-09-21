import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { UserItemResponseType } from "../models/user";
import { CompanyItemResponseType } from "../models/company";
import { userService } from "../services/UserService";
import { queryKeys } from "../services/QueryClientManager";

type User = UserItemResponseType;

type Company = CompanyItemResponseType;

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	company: Company | null;
	token: string | null;
	login: (token: string) => void;
	logout: () => void;
	refetchUser: () => void;
	refetchCompany: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [token, setToken] = useState<string | null>(() => {
		return localStorage.getItem("accessToken");
	});

	const isAuthenticated = !!token;

	// Configure axios with token
	useEffect(() => {
		if (token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		} else {
			delete axios.defaults.headers.common["Authorization"];
		}
	}, [token]);

	// !example of fetch current user using service
	const {
		data: user,
		isLoading: userLoading,
		refetch: refetchUser,
		error: userError,
	} = useQuery({
		queryKey: [queryKeys.CURRENT_USER],
		queryFn: async (): Promise<User> => {
			const response = await userService.getCurrentUser();
			return response.data;
		},
		enabled: isAuthenticated,
		retry: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// TODO: Company fetching disabled - user response no longer includes company field
	// const {
	//   data: company,
	//   isLoading: companyLoading,
	//   refetch: refetchCompany,
	//   error: companyError
	// } = useQuery({
	//   queryKey: ['currentCompany'],
	//   queryFn: async (): Promise<Company> => {
	//     const response = await axios.get(`${API_URL}/api/companies/current`);
	//     return response.data;
	//   },
	//   enabled: isAuthenticated,
	//   retry: false,
	//   staleTime: 1000 * 60 * 10, // 10 minutes
	// });

	// Temporary: No company data available
	const company = null;
	const refetchCompany = () => Promise.resolve();
	const companyError = null;

	// Handle authentication errors
	useEffect(() => {
		if (userError || companyError) {
			const error = userError || companyError;
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				logout();
			}
		}
	}, [userError, companyError]);

	const login = (accessToken: string) => {
		localStorage.setItem("accessToken", accessToken);
		setToken(accessToken);
	};

	const logout = () => {
		localStorage.removeItem("accessToken");
		setToken(null);
		// Clear axios authorization header
		delete axios.defaults.headers.common["Authorization"];
	};

	const isLoading = userLoading; // companyLoading removed since company fetching is disabled

	const value: AuthContextType = {
		isAuthenticated,
		isLoading,
		user: user || null,
		company: company || null,
		token,
		login,
		logout,
		refetchUser,
		refetchCompany,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
