/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import React from "react";
import { Row, Col, Select, Card, Space, Button } from "antd";
import { useTranslation } from "react-i18next";
import { SearchInput } from "../../components/common/SearchInput";
import { LAWSUIT_STATUS } from "../../models/consts";

interface FilterOption {
	label: string;
	value: string;
}

interface LawsuitFiltersProps {
	search: string;
	status?: string;
	client?: string;
	court?: string;
	lawsuitStage?: string;
	lawsuitType?: string;
	clientsOptions?: FilterOption[];
	courtsOptions?: FilterOption[];
	lawsuitStagesOptions?: FilterOption[];
	lawsuitTypesOptions?: FilterOption[];
	onSearchChange: (value: string) => void;
	onFilterChange: (filterName: string, value: string | undefined) => void;
	onClearFilters: () => void;
	getStatusDisplayName: (status: LAWSUIT_STATUS) => string;
}

export const LawsuitFilters: React.FC<LawsuitFiltersProps> = ({
	search,
	status,
	client,
	court,
	lawsuitStage,
	lawsuitType,
	clientsOptions,
	courtsOptions,
	lawsuitStagesOptions,
	lawsuitTypesOptions,
	onSearchChange,
	onFilterChange,
	onClearFilters,
	getStatusDisplayName,
}) => {
	const { t } = useTranslation();

	// Generate status options from enum
	const statusOptions = Object.values(LAWSUIT_STATUS).map((statusValue) => ({
		label: getStatusDisplayName(statusValue),
		value: statusValue,
	}));

	return (
		<Card className='border-border'>
			<Space direction='vertical' size='middle' className='w-full'>
				{/* Filters Row */}
				<Row gutter={[16, 16]} align='middle'>
					<Col xs={24} sm={12} md={8} lg={4}>
						<Select
							placeholder={t("lawsuits.filter.status")}
							value={status}
							onChange={(value) => onFilterChange("status", value)}
							options={statusOptions}
							allowClear
							showSearch
							size='large'
							className='w-full'
							filterOption={(input, option) =>
								(option?.label ?? "")
									.toLowerCase()
									.includes(input.toLowerCase())
							}
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={5}>
						<Select
							placeholder={t("lawsuits.filter.client")}
							value={client}
							onChange={(value) => onFilterChange("client", value)}
							options={clientsOptions}
							allowClear
							showSearch
							size='large'
							className='w-full'
							filterOption={(input, option) =>
								(option?.label ?? "")
									.toLowerCase()
									.includes(input.toLowerCase())
							}
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={5}>
						<Select
							placeholder={t("lawsuits.filter.court")}
							value={court}
							onChange={(value) => onFilterChange("court", value)}
							options={courtsOptions}
							allowClear
							showSearch
							size='large'
							className='w-full'
							filterOption={(input, option) =>
								(option?.label ?? "")
									.toLowerCase()
									.includes(input.toLowerCase())
							}
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={5}>
						<Select
							placeholder={t("lawsuits.filter.lawsuitStage")}
							value={lawsuitStage}
							onChange={(value) => onFilterChange("lawsuitStage", value)}
							options={lawsuitStagesOptions}
							allowClear
							showSearch
							size='large'
							className='w-full'
							filterOption={(input, option) =>
								(option?.label ?? "")
									.toLowerCase()
									.includes(input.toLowerCase())
							}
						/>
					</Col>
					<Col xs={24} sm={12} md={8} lg={5}>
						<Select
							placeholder={t("lawsuits.filter.lawsuitType")}
							value={lawsuitType}
							onChange={(value) => onFilterChange("lawsuitType", value)}
							options={lawsuitTypesOptions}
							allowClear
							showSearch
							size='large'
							className='w-full'
							filterOption={(input, option) =>
								(option?.label ?? "")
									.toLowerCase()
									.includes(input.toLowerCase())
							}
						/>
					</Col>
				</Row>

				{/* Search and Clear Row */}
				<Row gutter={16} align='middle'>
					<Col xs={24} sm={16} md={12} lg={8}>
						<SearchInput
							value={search}
							onChange={onSearchChange}
							placeholder={t("lawsuits.search.placeholder")}
						/>
					</Col>
					<Col xs={24} sm={8} md={12} lg={16}>
						<Space className='w-full justify-end'>
							<Button onClick={onClearFilters}>{t("lawsuits.filter.clear")}</Button>
						</Space>
					</Col>
				</Row>
			</Space>
		</Card>
	);
};
