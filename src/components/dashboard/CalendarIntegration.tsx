
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';

interface CalendarIntegrationProps {
  tasks: Task[];
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ tasks }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Tasks for {date?.toLocaleDateString()}</h3>
          <ul>
            {tasks
              .filter(
                (task) =>
                  new Date(task.dueDate).toDateString() === date?.toDateString()
              )
              .map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
