/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React from "react";
import { Card, Skeleton } from "antd";

export const EventCardSkeleton: React.FC = () => {
	return (
		<Card className="border-border h-full" styles={{ body: { padding: "20px" } }}>
			{/* Header with Title and Actions */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<Skeleton.Input active size="small" style={{ width: 150, marginBottom: 8 }} />
					<Skeleton.Input active size="small" style={{ width: 100 }} />
				</div>
				<div className="flex gap-2">
					<Skeleton.Button active size="small" shape="circle" />
					<Skeleton.Button active size="small" shape="circle" />
				</div>
			</div>

			{/* Description */}
			<div className="mb-3">
				<Skeleton.Input active size="small" style={{ width: "100%", marginBottom: 4 }} />
				<Skeleton.Input active size="small" style={{ width: "80%" }} />
			</div>

			{/* Date Range */}
			<div className="mb-3">
				<Skeleton.Input active size="small" style={{ width: "60%" }} />
			</div>

			{/* Footer with Lawsuit and Clients */}
			<div className="mt-4 pt-3 border-t border-border space-y-2">
				<Skeleton.Input active size="small" style={{ width: "70%" }} />
				<div className="flex gap-2">
					<Skeleton.Avatar active size="small" shape="circle" />
					<Skeleton.Avatar active size="small" shape="circle" />
					<Skeleton.Avatar active size="small" shape="circle" />
				</div>
			</div>
		</Card>
	);
};
