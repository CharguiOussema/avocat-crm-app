/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React from "react";
import { Card, Skeleton } from "antd";

export const LawsuitCardSkeleton: React.FC = () => {
	return (
		<Card className="border-border h-full" styles={{ body: { padding: "20px" } }}>
			{/* Header with Code and Actions */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<Skeleton.Input active size="small" style={{ width: 120, marginBottom: 8 }} />
					<Skeleton.Input active size="small" style={{ width: 80 }} />
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

			{/* Details */}
			<div className="space-y-2 mb-3">
				<Skeleton.Input active size="small" style={{ width: "90%" }} />
				<Skeleton.Input active size="small" style={{ width: "70%" }} />
				<Skeleton.Input active size="small" style={{ width: "85%" }} />
			</div>

			{/* Footer with Clients */}
			<div className="mt-4 pt-3 border-t border-border">
				<div className="flex gap-2">
					<Skeleton.Avatar active size="small" shape="circle" />
					<Skeleton.Avatar active size="small" shape="circle" />
					<Skeleton.Avatar active size="small" shape="circle" />
				</div>
			</div>
		</Card>
	);
};
