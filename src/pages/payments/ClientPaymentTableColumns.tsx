import { Space, Button, Tag, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ClientPaymentItemResponseType } from "../../models/clientPayment";
import { PaymentItemResponseType } from "../../models/payment";
import { TFunction } from "i18next";
import moment from "moment";

interface ClientPaymentTableColumnsProps {
	t: TFunction;
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string, title: string) => void;
}

export const useClientPaymentTableColumns = ({
	t,
	onView,
	onEdit,
	onDelete,
}: ClientPaymentTableColumnsProps): ColumnsType<ClientPaymentItemResponseType> => {
	return [
		{
			title: t("payments.table.title"),
			dataIndex: "title",
			key: "title",
			render: (title: string) => <span className="font-medium">{title}</span>,
		},
		{
			title: t("payments.table.client"),
			dataIndex: ["client", "fullName"],
			key: "client",
			render: (fullName: string) => <span>{fullName}</span>,
		},
		{
			title: t("payments.table.targetPrice"),
			dataIndex: "targetPrice",
			key: "targetPrice",
			render: (targetPrice: number) => (
				<span className="font-medium text-blue-600">
					{targetPrice.toLocaleString()} TND
				</span>
			),
		},
		{
			title: t("payments.table.total"),
			dataIndex: "total",
			key: "total",
			render: (total: number) => (
				<span className="font-medium text-green-600">
					{total.toLocaleString()} TND
				</span>
			),
		},
		{
			title: t("payments.table.progress"),
			key: "progress",
			render: (_text: unknown, record: ClientPaymentItemResponseType) => {
				const percentage = record.targetPrice > 0
					? Math.min((record.total / record.targetPrice) * 100, 100)
					: 0;
				const color = percentage >= 100 ? "green" : percentage >= 50 ? "orange" : "red";
				return (
					<Tag color={color}>
						{percentage.toFixed(1)}%
					</Tag>
				);
			},
		},
		{
			title: t("payments.table.paymentsCount"),
			dataIndex: "payments",
			key: "paymentsCount",
			render: (payments: PaymentItemResponseType[]) => (
				<Tag color="blue">{payments.length} {t("payments.table.paymentsLabel")}</Tag>
			),
		},
		{
			title: t("payments.table.createdAt"),
			dataIndex: "createdAt",
			key: "createdAt",
			render: (createdAt: string) => moment(createdAt).format("DD/MM/YYYY"),
		},
		{
			title: t("common.table.actions"),
			key: "actions",
			fixed: "right",
			width: 150,
			render: (_text: unknown, record: ClientPaymentItemResponseType) => (
				<Space size="small">
					<Tooltip title={t("common.actions.view")}>
						<Button
							type="text"
							icon={<EyeOutlined />}
							onClick={() => onView(record._id)}
						/>
					</Tooltip>
					<Tooltip title={t("common.actions.edit")}>
						<Button
							type="text"
							icon={<EditOutlined />}
							onClick={() => onEdit(record._id)}
						/>
					</Tooltip>
					<Tooltip title={t("common.actions.delete")}>
						<Button
							type="text"
							danger
							icon={<DeleteOutlined />}
							onClick={() => onDelete(record._id, record.title)}
						/>
					</Tooltip>
				</Space>
			),
		},
	];
};
