import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const events = [
    {
      title: "Team Meeting",
      start: new Date(2024, 6, 20, 10, 0),
      end: new Date(2024, 6, 20, 11, 0),
    },
  ];

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default CalendarPage;
