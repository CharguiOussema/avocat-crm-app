/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/8/2025
 */

import React from "react";
import { Row, Col, Select, Card, Button } from "antd";
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
}) => {
	const { t } = useTranslation();

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
					<Select
						placeholder={t("events.filter.client")}
						value={client}
						onChange={(value) => onFilterChange("client", value)}
						options={clientsOptions}
						allowClear
						showSearch
						size='large'
						className='w-full'
						filterOption={(input, option) =>
							(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
						}
					/>
				</Col>
				<Col xs={24} sm={12} md={8} lg={5}>
					<Select
						placeholder={t("events.filter.lawsuit")}
						value={lawsuit}
						onChange={(value) => onFilterChange("lawsuit", value)}
						options={lawsuitsOptions}
						allowClear
						showSearch
						size='large'
						className='w-full'
						filterOption={(input, option) =>
							(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
						}
					/>
				</Col>

				<Col xs={24} sm={12} md={24} lg={6}>
					<div className='flex justify-end'>
						<Button onClick={onClearFilters} size='large'>
							{t("events.filter.clear")}
						</Button>
					</div>
				</Col>
			</Row>
		</Card>
	);
};
