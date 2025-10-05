/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import React from "react";
import { Card, Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { LawsuitItemResponseType } from "../../models/lawsuit";

interface LawsuitTableProps {
	lawsuits: LawsuitItemResponseType[];
	columns: ColumnsType<LawsuitItemResponseType>;
	loading: boolean;
	selectedRowKeys: React.Key[];
	pagination: {
		current: number;
		pageSize: number;
		total: number;
	};
	onSelectionChange: (selectedRowKeys: React.Key[]) => void;
	onTableChange: (pagination: TablePaginationConfig) => void;
}

export const LawsuitTable: React.FC<LawsuitTableProps> = ({
	lawsuits,
	columns,
	loading,
	selectedRowKeys,
	pagination,
	onSelectionChange,
	onTableChange,
}) => {
	const { t } = useTranslation();

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectionChange,
	};

	return (
		<Card className='border-border'>
			<Table
				rowSelection={rowSelection}
				columns={columns}
				dataSource={lawsuits}
				rowKey='_id'
				pagination={{
					current: pagination.current,
					pageSize: pagination.pageSize,
					total: pagination.total,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (total, range) =>
						t("common.pagination.total", {
							start: range[0],
							end: range[1],
							total,
						}),
				}}
				onChange={onTableChange}
				loading={loading}
				className='lawsuits-table'
			/>
		</Card>
	);
};
