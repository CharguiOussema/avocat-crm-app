/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/22/2025
 */

import { Space, Tooltip, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PaymentItemResponseType } from "../../models/payment";
import { PAYMENT_TYPE } from "../../models/consts";

interface PaymentTableColumnsProps {
	t: (key: string, options?: Record<string, unknown>) => string;
	onEdit: (paymentId: string) => void;
	onDelete: (paymentId: string, description: string) => void;
}

// Map payment type to color for tag display
const getPaymentTypeColor = (type: PAYMENT_TYPE): string => {
	switch (type) {
		case PAYMENT_TYPE.CASH:
			return "green";
		case PAYMENT_TYPE.CHECK:
			return "blue";
		case PAYMENT_TYPE.BANK_TRANSFER:
			return "purple";
		default:
			return "default";
	}
};

export const usePaymentTableColumns = ({
	t,
	onEdit,
	onDelete,
}: PaymentTableColumnsProps): ColumnsType<PaymentItemResponseType> => {
	const columns: ColumnsType<PaymentItemResponseType> = [
		{
			title: t("payments.table.description"),
			dataIndex: "description",
			key: "description",
			sorter: true,
			render: (text: string) => (
				<span className='font-medium text-card-foreground'>{text}</span>
			),
		},
		{
			title: t("payments.table.type"),
			dataIndex: "type",
			key: "type",
			width: 150,
			render: (type: PAYMENT_TYPE) => (
				<Tag color={getPaymentTypeColor(type)}>
					{t(`payments.type.${type.toLowerCase()}`)}
				</Tag>
			),
		},
		{
			title: t("payments.table.price"),
			dataIndex: "price",
			key: "price",
			width: 120,
			sorter: true,
			render: (price: number) => (
				<span className='font-medium text-card-foreground'>
					{new Intl.NumberFormat('fr-TN', {
						style: 'currency',
						currency: 'TND',
					}).format(price)}
				</span>
			),
		},
		{
			title: t("payments.table.client"),
			dataIndex: ["client", "fullName"],
			key: "client",
			responsive: ["md"],
			render: (fullName: string) => (
				<span className='text-card-foreground'>{fullName}</span>
			),
		},
		{
			title: t("payments.table.lawsuit"),
			dataIndex: "lawsuit",
			key: "lawsuit",
			responsive: ["lg"],
			render: (lawsuit: string | null) => (
				<span className='text-muted-foreground'>
					{lawsuit || t("common.notProvided")}
				</span>
			),
		},
		{
			title: t("payments.table.createdAt"),
			dataIndex: "createdAt",
			key: "createdAt",
			sorter: true,
			responsive: ["lg"],
			render: (date: string) => (
				<span className='text-muted-foreground'>
					{new Date(date).toLocaleDateString()}
				</span>
			),
		},
		{
			title: t("payments.table.createdBy"),
			dataIndex: ["createdBy", "fullName"],
			key: "createdBy",
			responsive: ["xl"],
			render: (fullName: string) => (
				<span className='text-muted-foreground'>{fullName}</span>
			),
		},
		{
			title: t("payments.table.actions"),
			key: "actions",
			width: 120,
			render: (_text: string, record: PaymentItemResponseType) => (
				<Space size='small'>
					<Tooltip title={t("ui.edit")}>
						<Button
							type='text'
							icon={<EditOutlined />}
							onClick={() => onEdit(record._id)}
							className='text-primary hover:bg-primary/10'
						/>
					</Tooltip>
					<Tooltip title={t("ui.delete")}>
						<Button
							type='text'
							danger
							icon={<DeleteOutlined />}
							onClick={() => onDelete(record._id, record.description)}
							className='text-destructive hover:bg-destructive/10'
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	return columns;
};
