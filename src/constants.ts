// Configuration types
export type ConfigType = {
	API_URL: string;
	CRM_URL: string;
};

// Environment-specific configurations
const DEV_CONFIG: ConfigType = {
	API_URL: "http://localhost:3003",
	CRM_URL: "http://localhost:5175",
};

const PRODUCTION_CONFIG: ConfigType = {
	API_URL: "http://localhost:3005",
	CRM_URL: "http://localhost:5173",
};

const TEST_CONFIG: ConfigType = {
	API_URL: "http://localhost:3005",
	CRM_URL: "http://localhost:5173",
};

// Get current environment
const getEnvironment = (): "development" | "production" | "test" => {
	if (import.meta.env.MODE === "test") return "test";
	if (import.meta.env.MODE === "production") return "production";
	return "development";
};

// Get configuration based on environment
const getConfig = (): ConfigType => {
	const env = getEnvironment();

	switch (env) {
		case "production":
			return PRODUCTION_CONFIG;
		case "test":
			return TEST_CONFIG;
		case "development":
		default:
			return DEV_CONFIG;
	}
};

// Export the configuration
export const CONFIG = getConfig();

// Export individual constants for convenience
export const API_URL = CONFIG.API_URL;
export const CRM_URL = CONFIG.CRM_URL;

// Environment utilities
export const isDevelopment = getEnvironment() === "development";
export const isProduction = getEnvironment() === "production";
export const isTest = getEnvironment() === "test";
