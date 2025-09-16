
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import { ScrollArea } from '../ui/scroll-area';

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
      <CardContent className="flex-grow flex flex-col">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border self-center"
        />
        <div className="mt-4 flex-grow flex flex-col">
          <h3 className="text-base font-semibold mb-2">Tasks for {date?.toLocaleDateString()}</h3>
          <ScrollArea className='flex-grow'>
            <ul className='pr-4'>
              {tasks
                .filter(
                  (task) =>
                    new Date(task.dueDate).toDateString() === date?.toDateString()
                )
                .map((task) => (
                  <li key={task.id} className='text-sm text-muted-foreground'>{task.title}</li>
                ))}
            </ul>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
