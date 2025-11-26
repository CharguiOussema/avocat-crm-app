/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/25/2025
 */

import React from "react";
import { Card, Skeleton } from "antd";

export const ClientCardSkeleton: React.FC = () => {
	return (
		<Card className="border-border h-full" styles={{ body: { padding: "20px" } }}>
			{/* Header with Avatar and Actions */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3 flex-1">
					<Skeleton.Avatar active size={56} shape="circle" />
					<div className="flex-1">
						<Skeleton.Input active size="small" style={{ width: 150, marginBottom: 8 }} />
						<Skeleton.Input active size="small" style={{ width: 100 }} />
					</div>
				</div>
				<div className="flex gap-2">
					<Skeleton.Button active size="small" shape="circle" />
					<Skeleton.Button active size="small" shape="circle" />
				</div>
			</div>

			{/* Contact Information */}
			<div className="space-y-3">
				<Skeleton.Input active size="small" style={{ width: "100%" }} />
				<Skeleton.Input active size="small" style={{ width: "80%" }} />
				<Skeleton.Input active size="small" style={{ width: "60%" }} />
				<Skeleton.Input active size="small" style={{ width: "70%" }} />
			</div>

			{/* Footer */}
			<div className="mt-4 pt-3 border-t border-border">
				<Skeleton.Input active size="small" style={{ width: 120 }} />
			</div>
		</Card>
	);
};
