/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import React, { useState, useCallback } from "react";
import { Typography, Tabs, Button } from "antd";
import {
	CalendarOutlined,
	UnorderedListOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { EventList } from "./EventList";
import { EventCalendar } from "./EventCalendar";
import { EventFormModal } from "./EventFormModal";
import type { EventItemResponseType } from "../../models/event";

const { Title } = Typography;

export const Events: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const [activeTab, setActiveTab] = useState("list");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingEvent, setEditingEvent] =
		useState<EventItemResponseType | null>(null);

	// Modal handlers
	const handleAdd = useCallback(() => {
		setEditingEvent(null);
		setIsModalOpen(true);
	}, []);

	const handleEdit = useCallback((event: EventItemResponseType) => {
		setEditingEvent(event);
		setIsModalOpen(true);
	}, []);

	const handleModalClose = useCallback(() => {
		setIsModalOpen(false);
		setEditingEvent(null);
	}, []);

	const tabItems = [
		{
			key: "list",
			label: (
				<span className='flex items-center gap-2'>
					<UnorderedListOutlined />
					{t("events.tabs.list")}
				</span>
			),
			children: <EventList onEdit={handleEdit} />,
		},
		{
			key: "calendar",
			label: (
				<span className='flex items-center gap-2'>
					<CalendarOutlined />
					{t("events.tabs.calendar")}
				</span>
			),
			children: <EventCalendar />,
		},
	];

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div
				className={cn(
					"flex items-center justify-between",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div>
					<Title level={2} className='!mb-2 text-card-foreground'>
						{t("events.title")}
					</Title>
					<p className='text-muted-foreground'>{t("events.subtitle")}</p>
				</div>
				<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
					{t("events.add.button")}
				</Button>
			</div>

			{/* Tabs */}
			<Tabs
				activeKey={activeTab}
				onChange={setActiveTab}
				items={tabItems}
				size='large'
			/>

			{/* Event Form Modal */}
			<EventFormModal
				open={isModalOpen}
				event={editingEvent}
				onClose={handleModalClose}
			/>
		</div>
	);
};
