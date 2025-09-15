import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Users, FileText, Calendar } from "lucide-react";
import clsx from "clsx";
import { useApp } from "../contexts/AppContext";

const StatCard: React.FC<{
	title: string;
	value: string;
	icon: React.ReactNode;
	isRTL: boolean;
}> = ({ title, value, icon, isRTL }) => (
	<div className='bg-card p-6 rounded-lg border border-border'>
		<div
			className={clsx(
				"flex items-center justify-between",
				isRTL && "flex-row-reverse"
			)}
		>
			<div className={clsx(isRTL && "text-right")}>
				<p className='text-sm font-medium text-muted-foreground'>{title}</p>
				<p className='text-2xl font-bold text-foreground'>{value}</p>
			</div>
			<div className='text-primary'>{icon}</div>
		</div>
	</div>
);

export const Dashboard: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();

	const stats = [
		{
			title: t("navigation.clients"),
			value: "127",
			icon: <Users size={24} />,
		},
		{
			title: t("navigation.cases"),
			value: "89",
			icon: <FileText size={24} />,
		},
		{
			title: t("navigation.reports"),
			value: "34",
			icon: <BarChart3 size={24} />,
		},
		{
			title: t("navigation.calendar"),
			value: "12",
			icon: <Calendar size={24} />,
		},
	];

	return (
		<div className='space-y-6'>
			<div className={clsx(isRTL && "text-right")}>
				<h1 className='text-3xl font-bold text-foreground'>
					{t("navigation.dashboard")}
				</h1>
				<p className='text-muted-foreground mt-2'>{t("app.welcome")}</p>
			</div>

			{/* Stats Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{stats.map((stat, index) => (
					<StatCard
						key={index}
						title={stat.title}
						value={stat.value}
						icon={stat.icon}
						isRTL={isRTL}
					/>
				))}
			</div>

			{/* Content Area */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<div className='bg-card p-6 rounded-lg border border-border'>
					<h2
						className={clsx(
							"text-xl font-semibold text-foreground mb-4",
							isRTL && "text-right"
						)}
					>
						Recent Activity
					</h2>
					<div className='space-y-3'>
						{[1, 2, 3].map((item) => (
							<div
								key={item}
								className={clsx(
									"flex items-center gap-3 p-3 bg-muted rounded-md",
									isRTL && "flex-row-reverse"
								)}
							>
								<div className='w-2 h-2 bg-primary rounded-full'></div>
								<div className={clsx("flex-1", isRTL && "text-right")}>
									<p className='text-sm font-medium text-foreground'>
										Case #{item} updated
									</p>
									<p className='text-xs text-muted-foreground'>2 hours ago</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className='bg-card p-6 rounded-lg border border-border'>
					<h2
						className={clsx(
							"text-xl font-semibold text-foreground mb-4",
							isRTL && "text-right"
						)}
					>
						Upcoming Appointments
					</h2>
					<div className='space-y-3'>
						{[1, 2, 3].map((item) => (
							<div
								key={item}
								className={clsx(
									"flex items-center gap-3 p-3 bg-muted rounded-md",
									isRTL && "flex-row-reverse"
								)}
							>
								<Calendar size={16} className='text-primary' />
								<div className={clsx("flex-1", isRTL && "text-right")}>
									<p className='text-sm font-medium text-foreground'>
										Client Meeting #{item}
									</p>
									<p className='text-xs text-muted-foreground'>
										Tomorrow at 10:00 AM
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
