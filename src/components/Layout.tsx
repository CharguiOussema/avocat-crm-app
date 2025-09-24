import React, { useEffect, useState } from "react";
import { Layout as AntdLayout, Card } from "antd";
import { useApp } from "../hooks";
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
		<AntdLayout style={{ minHeight: "100vh", overflow: "hidden" }}>
			<Sidebar />
			<AntdLayout
				style={{
					marginLeft: !isMobile && sidebarOpen ? 200 : 0,
					transition: "margin-left 0.3s ease",
					display: "flex",
					flexDirection: "column",
					height: "100vh",
				}}
			>
				{/* Fixed Navbar */}
				<div
					style={{
						position: "fixed",
						top: 0,
						right: 0,
						left: !isMobile && sidebarOpen ? 200 : 0,
						zIndex: 998,
						transition: "left 0.3s ease",
					}}
				>
					<Navbar />
				</div>

				{/* Scrollable Content Area */}
				<Content
					style={{
						marginTop: "64px", // Account for fixed navbar height
						padding: isMobile ? "16px" : "24px",
						overflow: "auto",
						background: "transparent",
						height: "calc(100vh - 64px)",
						flex: 1,
					}}
					className='custom-scrollbar'
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
