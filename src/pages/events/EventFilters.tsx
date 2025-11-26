/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/8/2025
 */

import React, { useCallback } from "react";
import { Row, Col, Select, Card, Button } from "antd";
import type { DefaultOptionType } from "antd/es/select";
import { useTranslation } from "react-i18next";
import { SearchInput } from "../../components/common/SearchInput";

interface FilterOption {
	label: string;
	value: string;
}

interface EventFiltersProps {
	search: string;
	lawsuit?: string;
	client?: string;
	lawsuitsOptions?: FilterOption[];
	clientsOptions?: FilterOption[];
	onSearchChange: (value: string) => void;
	onFilterChange: (filterName: string, value: string | undefined) => void;
	onClearFilters: () => void;
	children?: React.ReactNode;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
	search,
	lawsuit,
	client,
	lawsuitsOptions,
	clientsOptions,
	onSearchChange,
	onFilterChange,
	onClearFilters,
	children,
}) => {
	const { t } = useTranslation();

	// Handle client filter change
	const handleClientChange = useCallback(
		(value: string | undefined) => {
			onFilterChange("client", value);
		},
		[onFilterChange]
	);

	// Handle lawsuit filter change
	const handleLawsuitChange = useCallback(
		(value: string | undefined) => {
			onFilterChange("lawsuit", value);
		},
		[onFilterChange]
	);

	// Filter option handler for Select components
	const filterOption = useCallback(
		(input: string, option: DefaultOptionType | undefined): boolean => {
			const label = option?.label;
			if (typeof label === "string") {
				return label.toLowerCase().includes(input.toLowerCase());
			}
			return false;
		},
		[]
	);

	return (
		<Card className='border-border'>
			<Row gutter={16} align='middle'>
				<Col xs={24} sm={12} md={8} lg={8}>
					<SearchInput
						value={search}
						onChange={onSearchChange}
						placeholder={t("events.search.placeholder")}
					/>
				</Col>
				<Col xs={24} sm={12} md={8} lg={5}>
					<Select<string>
						placeholder={t("events.filter.client")}
						value={client}
						onChange={handleClientChange}
						options={clientsOptions}
						allowClear
						showSearch
						size='large'
						className='w-full'
						filterOption={filterOption}
					/>
				</Col>
				<Col xs={24} sm={12} md={8} lg={5}>
					<Select<string>
						placeholder={t("events.filter.lawsuit")}
						value={lawsuit}
						onChange={handleLawsuitChange}
						options={lawsuitsOptions}
						allowClear
						showSearch
						size='large'
						className='w-full'
						filterOption={filterOption}
					/>
				</Col>

				<Col xs={24} sm={12} md={24} lg={6}>
					<div className='flex justify-end gap-3'>
						{children}
						<Button onClick={onClearFilters} size='large'>
							{t("events.filter.clear")}
						</Button>
					</div>
				</Col>
			</Row>
		</Card>
	);
};
