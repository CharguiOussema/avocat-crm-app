/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/29/2025
 */

import React from "react";
import { Card, Skeleton } from "antd";

export const ClientPaymentCardSkeleton: React.FC = () => {
	return (
		<Card className="border-border h-full" styles={{ body: { padding: "20px" } }}>
			{/* Header with Title and Actions */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<Skeleton.Input active size="small" style={{ width: 180, marginBottom: 8 }} />
					<Skeleton.Input active size="small" style={{ width: 100 }} />
				</div>
				<div className="flex gap-2">
					<Skeleton.Button active size="small" shape="circle" />
					<Skeleton.Button active size="small" shape="circle" />
					<Skeleton.Button active size="small" shape="circle" />
				</div>
			</div>

			{/* Client Information */}
			<div className="space-y-3 mb-4">
				<Skeleton.Input active size="small" style={{ width: "100%" }} />
				<Skeleton.Input active size="small" style={{ width: "90%" }} />
			</div>

			{/* Financial Information */}
			<div className="space-y-2 mb-3">
				<Skeleton.Input active size="small" style={{ width: "100%" }} />
				<Skeleton.Input active size="small" style={{ width: "100%" }} />
			</div>

			{/* Progress Bar */}
			<div className="mb-3">
				<Skeleton.Input active size="small" style={{ width: "100%", height: 8 }} />
			</div>

			{/* Footer */}
			<div className="pt-3 border-t border-border flex items-center justify-between">
				<Skeleton.Input active size="small" style={{ width: 80 }} />
				<Skeleton.Input active size="small" style={{ width: 120 }} />
			</div>
		</Card>
	);
};
