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
import { Spin, Alert } from "antd";
import { useTranslation } from "react-i18next";
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

			<EventFormModal
				open={isModalOpen}
				event={selectedEvent}
				onClose={handleModalClose}
				initialDate={selectedDate}
			/>
		</div>
	);
};
