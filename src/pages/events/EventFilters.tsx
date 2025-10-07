/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/8/2025
 */

import React from "react";
import { Row, Col, Card, Space, Button } from "antd";
import { useTranslation } from "react-i18next";
import { SearchInput } from "../../components/common/SearchInput";

interface EventFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	onClearFilters: () => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
	search,
	onSearchChange,
	onClearFilters,
}) => {
	const { t } = useTranslation();

	return (
		<Card className="border-border">
			<Row gutter={16} align="middle">
				<Col xs={24} sm={16} md={12} lg={8}>
					<SearchInput
						value={search}
						onChange={onSearchChange}
						placeholder={t("events.search.placeholder")}
					/>
				</Col>
				<Col xs={24} sm={8} md={12} lg={16}>
					<Space className="w-full justify-end">
						<Button onClick={onClearFilters}>{t("events.filter.clear")}</Button>
					</Space>
				</Col>
			</Row>
		</Card>
	);
};
