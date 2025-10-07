/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import React from "react";
import { Table, Button, Space, Tag, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { Breakpoint } from "antd/es/_util/responsiveObserver";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import type { EventItemResponseType } from "../../models/event";

interface EventTableProps {
	events: EventItemResponseType[];
	loading: boolean;
	selectedRowKeys: React.Key[];
	pagination: TablePaginationConfig;
	onSelectionChange: (selectedRowKeys: React.Key[]) => void;
	onTableChange: (pagination: TablePaginationConfig) => void;
	onEdit: (event: EventItemResponseType) => void;
	onDelete: (eventId: string, eventName: string) => void;
}

export const EventTable: React.FC<EventTableProps> = ({
	events,
	loading,
	selectedRowKeys,
	pagination,
	onSelectionChange,
	onTableChange,
	onEdit,
	onDelete,
}) => {
	const { t } = useTranslation();

	const columns: ColumnsType<EventItemResponseType> = [
		{
			title: t("events.table.name"),
			dataIndex: "name",
			key: "name",
			ellipsis: true,
			responsive: ["xs", "sm", "md", "lg", "xl"] as Breakpoint[],
		},
		// {
		// 	title: t("events.table.description"),
		// 	dataIndex: "description",
		// 	key: "description",
		// 	ellipsis: true,
		// 	responsive: ["sm", "md", "lg", "xl"] as Breakpoint[],
		// 	render: (description: string | null) =>
		// 		description || t("common.notProvided"),
		// },
		{
			title: t("events.table.clients"),
			dataIndex: "clients",
			key: "clients",
			responsive: ["md", "lg", "xl"] as Breakpoint[],
			render: (clients: EventItemResponseType["clients"]) => (
				<div className='flex flex-wrap gap-1'>
					{clients.length > 0 ? (
						clients.map((client) => (
							<Tag key={client._id}>{client.fullName}</Tag>
						))
					) : (
						<span className='text-muted-foreground'>
							{t("common.notProvided")}
						</span>
					)}
				</div>
			),
		},
		{
			title: t("events.table.lawsuit"),
			dataIndex: "lawsuit",
			key: "lawsuit",
			responsive: ["lg", "xl"] as Breakpoint[],
			render: (lawsuit: EventItemResponseType["lawsuit"]) =>
				lawsuit ? (
					<Tag color='blue'>{lawsuit.lawsuitCode}</Tag>
				) : (
					t("common.notProvided")
				),
		},
		{
			title: t("events.table.startDate"),
			dataIndex: "startDate",
			key: "startDate",
			responsive: ["md", "lg", "xl"] as Breakpoint[],
			render: (date: string) => dayjs(date).format("DD MMM YYYY HH:mm"),
		},
		{
			title: t("events.table.endDate"),
			dataIndex: "endDate",
			key: "endDate",
			responsive: ["lg", "xl"] as Breakpoint[],
			render: (date: string) => dayjs(date).format("DD MMM YYYY HH:mm"),
		},
		{
			title: t("events.table.actions"),
			key: "actions",
			align: "center",
			render: (_, record) => (
				<Space size='small' className='flex justify-center'>
					<Tooltip title={t("ui.edit")}>
						<Button
							type='link'
							size='small'
							icon={<EditOutlined />}
							onClick={() => onEdit(record)}
						/>
					</Tooltip>
					<Tooltip title={t("ui.delete")}>
						<Button
							type='link'
							size='small'
							danger
							icon={<DeleteOutlined />}
							onClick={() => onDelete(record._id, record.name)}
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectionChange,
	};

	return (
		<div className='w-full overflow-auto'>
			<Table
				rowSelection={rowSelection}
				columns={columns}
				dataSource={events}
				rowKey='_id'
				loading={loading}
				pagination={{
					...pagination,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (total, range) =>
						t("events.pagination.showTotal", {
							start: range[0],
							end: range[1],
							total,
						}),
					responsive: true,
				}}
				onChange={onTableChange}
				scroll={{ x: "max-content" }}
				className='w-full'
			/>
		</div>
	);
};
