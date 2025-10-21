/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "moment/locale/ar";
import { useQuery } from "react-query";
import { Spin, Alert, Modal, List, Typography, Badge, Divider, Empty } from "antd";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Text, Title } = Typography;
import { eventService } from "../../services/EventService";
import { queryKeys } from "../../services/QueryClientManager";
import { EventFormModal } from "./EventFormModal";
import type { EventItemResponseType } from "../../models/event";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import dayjs, { Dayjs } from "dayjs";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	resource: EventItemResponseType;
}

export const EventCalendar: React.FC = () => {
	const { t, i18n } = useTranslation();
	const [date, setDate] = useState(new Date());
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<EventItemResponseType | null>(null);
	const [selectedDate, setSelectedDate] = useState<Dayjs | undefined>();
	const [showMoreEvents, setShowMoreEvents] = useState<CalendarEvent[]>([]);
	const [showMoreModalOpen, setShowMoreModalOpen] = useState(false);

	// Set moment locale based on current language
	useEffect(() => {
		const currentLanguage = i18n.language;
		moment.locale(currentLanguage);
	}, [i18n.language]);

	const { data, error, isLoading } = useQuery(
		[queryKeys.EVENTS, "calendar"],
		async () => {
			const response = await eventService.getAll({ page: 1, limit: 1000 });
			return response.data.docs;
		},
		{
			refetchInterval: 60000, // Refetch every minute
			staleTime: 30000,
		}
	);

	const events: CalendarEvent[] = useMemo(() => {
		if (!data) return [];
		return data.map((event) => ({
			id: event._id,
			title: event.name,
			start: new Date(event.startDate),
			end: new Date(event.endDate),
			resource: event,
		}));
	}, [data]);

	const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
		setSelectedEvent(null);
		setSelectedDate(dayjs(slotInfo.start));
		setIsModalOpen(true);
	}, []);

	const handleSelectEvent = useCallback((event: CalendarEvent) => {
		setSelectedEvent(event.resource);
		setSelectedDate(undefined);
		setIsModalOpen(true);
	}, []);

	const handleModalClose = useCallback(() => {
		setIsModalOpen(false);
		setSelectedEvent(null);
		setSelectedDate(undefined);
	}, []);

	const handleShowMore = useCallback((events: CalendarEvent[]) => {
		setShowMoreEvents(events);
		setShowMoreModalOpen(true);
	}, []);

	const handleShowMoreModalClose = useCallback(() => {
		setShowMoreModalOpen(false);
		setShowMoreEvents([]);
	}, []);

	const handleEventClickInModal = useCallback((event: CalendarEvent) => {
		setShowMoreModalOpen(false);
		setShowMoreEvents([]);
		setSelectedEvent(event.resource);
		setSelectedDate(undefined);
		setIsModalOpen(true);
	}, []);

	const getModalWidth = (): string | number => {
		if (typeof window !== "undefined") {
			return window.innerWidth > 768 ? 650 : "90%";
		}
		return 650;
	};

	const eventStyleGetter = () => {
		const style: React.CSSProperties = {
			backgroundColor: "#1890ff",
			borderRadius: "4px",
			opacity: 0.8,
			color: "white",
			border: "0px",
			display: "block",
		};
		return { style };
	};

	const getErrorMessage = (error: unknown): string => {
		if (error instanceof Error) return error.message;
		if (typeof error === "string") return error;
		if (error && typeof error === "object" && "message" in error) {
			return String((error as { message: unknown }).message);
		}
		return t("common.unexpectedError");
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert
				message={t("events.error.title")}
				description={getErrorMessage(error)}
				type="error"
				showIcon
			/>
		);
	}

	return (
		<div className="space-y-4">
			<div className="bg-background p-4 rounded-lg border">
				<Calendar
					localizer={localizer}
					events={events}
					startAccessor="start"
					endAccessor="end"
					style={{ height: 700 }}
					view="month"
					views={["month"]}
					date={date}
					onNavigate={setDate}
					onSelectSlot={handleSelectSlot}
					onSelectEvent={handleSelectEvent}
					onShowMore={handleShowMore}
					selectable
					eventPropGetter={eventStyleGetter}
					toolbar={true}
					messages={{
						today: t("events.calendar.today"),
						previous: t("events.calendar.previous"),
						next: t("events.calendar.next"),
						date: t("events.calendar.date"),
						time: t("events.calendar.time"),
						event: t("events.calendar.event"),
						allDay: t("events.calendar.allDay"),
						noEventsInRange: t("events.calendar.noEventsInRange"),
						showMore: (count: number) => `+${count} ${t("events.calendar.showMore")}`,
					}}
				/>
			</div>

			<Modal
				open={showMoreModalOpen}
				onCancel={handleShowMoreModalClose}
				footer={null}
				width={getModalWidth()}
				centered
				title={
					<div className="flex items-center gap-3 pb-2">
						<CalendarOutlined className="text-2xl text-primary" />
						<div>
							<Title level={4} className="!mb-0">
								{t("events.calendar.moreEvents")}
							</Title>
							{showMoreEvents.length > 0 && (
								<Text type="secondary" className="text-sm">
									{showMoreEvents.length} {t("events.calendar.eventsCount")}
								</Text>
							)}
						</div>
					</div>
				}
				className="event-details-modal"
			>
				{showMoreEvents.length === 0 ? (
					<Empty
						description={t("events.calendar.noEventsInRange")}
						className="py-8"
					/>
				) : (
					<List
						dataSource={showMoreEvents}
						className="event-list"
						split={false}
						renderItem={(event, index) => (
							<div key={event.id}>
								<List.Item
									onClick={() => handleEventClickInModal(event)}
									className="cursor-pointer hover:bg-blue-50 transition-all duration-200 rounded-lg px-4 py-3 -mx-2 my-1"
									style={{ border: "none" }}
								>
									<div className="w-full">
										<div className="flex items-start justify-between gap-3 mb-3">
											<div className="flex-1">
												<Badge
													status="processing"
													text={
														<Text strong className="text-base">
															{event.title}
														</Text>
													}
												/>
											</div>
										</div>

										<div className="space-y-2 ml-6">
											<div className="flex items-center gap-2">
												<ClockCircleOutlined className="text-green-600" />
												<Text type="secondary" className="text-sm">
													<span className="font-medium">{t("events.calendar.start")}:</span>{" "}
													{moment(event.start).format("LLL")}
												</Text>
											</div>

											<div className="flex items-center gap-2">
												<ClockCircleOutlined className="text-red-600" />
												<Text type="secondary" className="text-sm">
													<span className="font-medium">{t("events.calendar.end")}:</span>{" "}
													{moment(event.end).format("LLL")}
												</Text>
											</div>
										</div>

										<div className="mt-3 ml-6">
											<Text type="secondary" className="text-xs italic">
												{t("events.calendar.clickToView")}
											</Text>
										</div>
									</div>
								</List.Item>
								{index !== undefined && index < showMoreEvents.length - 1 && (
									<Divider className="my-2" />
								)}
							</div>
						)}
					/>
				)}
			</Modal>

			<EventFormModal
				open={isModalOpen}
				event={selectedEvent}
				onClose={handleModalClose}
				initialDate={selectedDate}
			/>
		</div>
	);
};
