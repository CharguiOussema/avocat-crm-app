/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React from "react";
import { Card, Skeleton } from "antd";

export const CourtCardSkeleton: React.FC = () => {
	return (
		<Card
			className="border-border h-full min-h-[120px]"
			styles={{ body: { padding: "20px", display: "flex", flexDirection: "column", height: "100%" } }}
		>
			{/* Card Content */}
			<div className="flex flex-col gap-4 h-full">
				{/* Header with Icon and Name */}
				<div className="flex items-start gap-3 flex-1">
					<Skeleton.Avatar active size={48} shape="circle" />
					<div className="flex-1">
						<Skeleton.Input
							active
							size="small"
							style={{ width: "100%", maxWidth: 200 }}
						/>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end gap-2 pt-2 border-t border-border">
					<Skeleton.Button active size="small" shape="circle" style={{ width: 32, height: 32 }} />
					<Skeleton.Button active size="small" shape="circle" style={{ width: 32, height: 32 }} />
				</div>
			</div>
		</Card>
	);
};
