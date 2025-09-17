import React, { useEffect, useState } from "react";
import { Layout as AntdLayout, Card } from "antd";
import { useApp } from "../contexts/AppContext";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

const { Content } = AntdLayout;

interface LayoutProps {
	children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { sidebarOpen } = useApp();
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<AntdLayout style={{ minHeight: "100vh" }}>
			<Sidebar />
			<AntdLayout
				style={{
					marginLeft: !isMobile && sidebarOpen ? 200 : 0,
					transition: "margin-left 0.3s ease",
				}}
			>
				<Navbar />
				<Content
					style={{
						padding: isMobile ? "16px" : "24px",
						overflow: "auto",
						background: "transparent",
					}}
				>
					<Card
						bordered={false}
						style={{
							maxWidth: "100%",
							margin: "0 auto",
							boxShadow:
								"0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
						}}
						bodyStyle={{
							padding: isMobile ? "16px" : "24px",
						}}
					>
						{children}
					</Card>
				</Content>
			</AntdLayout>
		</AntdLayout>
	);
};
