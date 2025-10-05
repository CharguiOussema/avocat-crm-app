/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 2/10/2025
 */

import React, { useCallback } from "react";
import { Button, Checkbox, Popover, Space } from "antd";
import { FilterOutlined, DownOutlined } from "@ant-design/icons";
import { USER_ROLES } from "../../models/consts";

interface RoleFilterProps {
	selectedRoles: USER_ROLES[];
	availableRoles: USER_ROLES[];
	onChange: (roles: USER_ROLES[]) => void;
	getRoleDisplayName: (role: USER_ROLES) => string;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export const RoleFilter: React.FC<RoleFilterProps> = ({
	selectedRoles,
	availableRoles,
	onChange,
	getRoleDisplayName,
	t,
}) => {
	// Handle individual role checkbox change
	const handleRoleCheckboxChange = useCallback(
		(role: USER_ROLES, checked: boolean) => {
			let newSelectedRoles: USER_ROLES[];
			if (checked) {
				newSelectedRoles = [...selectedRoles, role];
			} else {
				newSelectedRoles = selectedRoles.filter((r) => r !== role);
			}
			onChange(newSelectedRoles);
		},
		[selectedRoles, onChange]
	);

	// Render role filter content
	const renderFilterContent = useCallback(() => {
		return (
			<div className="space-y-2 p-2 min-w-[200px]">
				{availableRoles.map((role) => (
					<div key={role} className="flex items-center">
						<Checkbox
							checked={selectedRoles.includes(role)}
							onChange={(e) => handleRoleCheckboxChange(role, e.target.checked)}
						>
							{getRoleDisplayName(role)}
						</Checkbox>
					</div>
				))}
				{selectedRoles.length > 0 && (
					<div className="pt-2 border-t border-gray-200">
						<Button
							type="link"
							size="small"
							onClick={() => onChange([])}
							className="text-red-500 p-0 h-auto"
						>
							{t("users.filter.clear")}
						</Button>
					</div>
				)}
			</div>
		);
	}, [availableRoles, selectedRoles, handleRoleCheckboxChange, getRoleDisplayName, onChange, t]);

	return (
		<Popover
			content={renderFilterContent()}
			title={t("users.filter.roles.title")}
			trigger="click"
			placement="bottomLeft"
		>
			<Button
				className="w-full text-left"
				style={{
					height: "32px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderColor: selectedRoles.length > 0 ? "#1890ff" : undefined,
					color: selectedRoles.length > 0 ? "#1890ff" : undefined,
				}}
			>
				<span>
					{selectedRoles.length > 0
						? `${selectedRoles.length} ${t("users.filter.roles.selected")}`
						: t("users.filter.roles.placeholder")}
				</span>
				<Space>
					<FilterOutlined />
					<DownOutlined style={{ fontSize: "12px" }} />
				</Space>
			</Button>
		</Popover>
	);
};
