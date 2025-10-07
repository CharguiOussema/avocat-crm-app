/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, message } from "antd";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { eventService } from "../../services/EventService";
import { clientService } from "../../services/ClientService";
import { lawsuitService } from "../../services/LawsuitService";
import { queryKeys } from "../../services/QueryClientManager";
import type { EventItemResponseType } from "../../models/event";
import dayjs, { Dayjs } from "dayjs";

const { TextArea } = Input;

interface EventFormModalProps {
	open: boolean;
	event: EventItemResponseType | null;
	onClose: () => void;
	initialDate?: Dayjs;
}

interface FormValues {
	name: string;
	description?: string;
	clients?: string[];
	lawsuit?: string;
	dateRange: [Dayjs, Dayjs];
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
	open,
	event,
	onClose,
	initialDate,
}) => {
	const { t } = useTranslation();
	const [form] = Form.useForm<FormValues>();
	const queryClient = useQueryClient();

	const { data: clientsOptions } = useQuery(
		[queryKeys.CLIENTS, "filter"],
		async () => {
			const response = await clientService.filter();
			return response.data;
		},
		{ enabled: open, staleTime: 1000 * 60 * 5 }
	);

	const { data: lawsuitsOptions } = useQuery(
		[queryKeys.LAWSUITS, "filter"],
		async () => {
			const response = await lawsuitService.filter();
			return response.data;
		},
		{ enabled: open, staleTime: 1000 * 60 * 5 }
	);

	const createMutation = useMutation(
		(values: FormValues) => {
			const [startDate, endDate] = values.dateRange;
			return eventService.create({
				name: values.name,
				description: values.description || null,
				clients: values.clients || [],
				lawsuit: values.lawsuit || null,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			});
		},
		{
			onSuccess: (response) => {
				message.success(t("events.create.success", { name: response.data.name }));
				queryClient.invalidateQueries(queryKeys.EVENTS);
				handleClose();
			},
			onError: () => {
				message.error(t("events.create.error"));
			},
		}
	);

	const updateMutation = useMutation(
		(values: FormValues) => {
			if (!event) throw new Error("No event to update");
			const [startDate, endDate] = values.dateRange;
			return eventService.update({
				_id: event._id,
				name: values.name,
				description: values.description || null,
				clients: values.clients || [],
				lawsuit: values.lawsuit || null,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			});
		},
		{
			onSuccess: (response) => {
				message.success(t("events.update.success", { name: response.data.name }));
				queryClient.invalidateQueries(queryKeys.EVENTS);
				handleClose();
			},
			onError: () => {
				message.error(t("events.update.error"));
			},
		}
	);

	useEffect(() => {
		if (open) {
			if (event) {
				form.setFieldsValue({
					name: event.name,
					description: event.description || undefined,
					clients: event.clients.map((c) => c._id),
					lawsuit: event.lawsuit?._id,
					dateRange: [dayjs(event.startDate), dayjs(event.endDate)],
				});
			} else {
				const start = initialDate || dayjs();
				form.setFieldsValue({
					dateRange: [start, start.add(1, "hour")],
				});
			}
		}
	}, [open, event, initialDate, form]);

	const handleClose = () => {
		form.resetFields();
		onClose();
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (event) {
				updateMutation.mutate(values);
			} else {
				createMutation.mutate(values);
			}
		} catch (error) {
			console.error("Validation failed:", error);
		}
	};

	return (
		<Modal
			title={event ? t("events.edit.title") : t("events.add.title")}
			open={open}
			onOk={handleSubmit}
			onCancel={handleClose}
			confirmLoading={createMutation.isLoading || updateMutation.isLoading}
			okText={event ? t("events.form.update") : t("events.form.create")}
			cancelText={t("ui.cancel")}
			width={600}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					name="name"
					label={t("events.form.name")}
					rules={[
						{ required: true, message: t("events.form.nameRequired") },
						{ min: 2, message: t("events.form.nameMinLength") },
					]}
				>
					<Input placeholder={t("events.form.namePlaceholder")} />
				</Form.Item>

				<Form.Item name="description" label={t("events.form.description")}>
					<TextArea
						rows={3}
						placeholder={t("events.form.descriptionPlaceholder")}
					/>
				</Form.Item>

				<Form.Item
					name="dateRange"
					label={t("events.form.startDate")}
					rules={[{ required: true, message: t("events.form.startDateRequired") }]}
				>
					<DatePicker.RangePicker
						showTime
						format="DD/MM/YYYY HH:mm"
						style={{ width: "100%" }}
					/>
				</Form.Item>

				<Form.Item name="clients" label={t("events.form.clients")}>
					<Select
						mode="multiple"
						placeholder={t("events.form.clientsPlaceholder")}
						options={clientsOptions}
						allowClear
					/>
				</Form.Item>

				<Form.Item name="lawsuit" label={t("events.form.lawsuit")}>
					<Select
						placeholder={t("events.form.lawsuitPlaceholder")}
						options={lawsuitsOptions}
						allowClear
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};
