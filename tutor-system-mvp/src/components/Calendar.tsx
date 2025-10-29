import FullCalendar from '@fullcalendar/react';
import type { DateSelectArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Session } from '../types';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

export type CalendarEvent = Session & { title: string };

type CalendarProps = {
  sessions: CalendarEvent[];
  onSelectSlot?: (slot: DateSelectArg) => void;
  onEventClick?: (event: CalendarEvent) => void;
};

export function Calendar({ sessions, onSelectSlot, onEventClick }: CalendarProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        themeSystem="standard"
        headerToolbar={{
          start: 'prev,next today',
          center: 'title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="auto"
        selectable
        selectMirror
        dayMaxEvents
        displayEventTime
        eventOverlap={false}
        select={(slot) => onSelectSlot?.(slot)}
        eventClick={(arg: EventClickArg) => {
          const eventSession = sessions.find((session) => session.id === Number(arg.event.id));
          if (eventSession) {
            onEventClick?.(eventSession);
          }
        }}
        eventContent={(eventContent: EventContentArg) => {
          const session = sessions.find((sessionItem) => sessionItem.id === Number(eventContent.event.id));
          if (!session) return null;
          return (
            <div className="space-y-1">
              <p className="font-medium text-xs md:text-sm">{eventContent.event.title}</p>
              <p className="text-[10px] text-slate-300">
                {format(eventContent.event.start!, 'HH:mm')} → {format(eventContent.event.end!, 'HH:mm')}
              </p>
              <Badge variant={session.status === 'Confirmed' ? 'success' : session.status === 'Cancelled' ? 'danger' : 'default'}>
                {session.status}
              </Badge>
            </div>
          );
        }}
        events={sessions.map((session) => ({
          id: session.id.toString(),
          title: session.title,
          start: `${session.date}T${session.start}`,
          end: `${session.date}T${session.end}`,
        }))}
      />
    </div>
  );
}