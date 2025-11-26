/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React from "react";
import { Card, Skeleton } from "antd";

export const CourtCardSkeleton: React.FC = () => {
	return (
		<Card className="border-border h-full" styles={{ body: { padding: "20px" } }}>
			{/* Header with Icon and Actions */}
			<div className="flex items-start justify-between mb-3">
				<div className="flex items-center gap-3 flex-1">
					<Skeleton.Avatar active size={40} shape="circle" />
					<div className="flex-1">
						<Skeleton.Input active size="small" style={{ width: 150, marginBottom: 4 }} />
						<Skeleton.Input active size="small" style={{ width: 100 }} />
					</div>
				</div>
				<div className="flex gap-2">
					<Skeleton.Button active size="small" shape="circle" />
					<Skeleton.Button active size="small" shape="circle" />
				</div>
			</div>
		</Card>
	);
};
