
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, Trader } from '@/types';

interface TaskManagementProps {
  traders: Trader[];
  tasks: Task[];
  onTaskCreate: (task: Omit<Task, 'id'>) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (traderId: string, taskId: string) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  traders,
  tasks,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);

  const handleAddTask = () => {
    if (taskTitle && taskDueDate && selectedTrader) {
      onTaskCreate({
        traderId: selectedTrader,
        title: taskTitle,
        dueDate: new Date(taskDueDate).toISOString(),
        completed: false,
      });
      setTaskTitle('');
      setTaskDueDate('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 mb-4">
        <Select onValueChange={setSelectedTrader} value={selectedTrader || ''}>
            <SelectTrigger>
                <SelectValue placeholder="Select a Trader..." />
            </SelectTrigger>
            <SelectContent>
                {traders.map(trader => (
                    <SelectItem key={trader.id} value={trader.id}>{trader.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
          <Input
            placeholder="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <Input
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
          />
          <Button onClick={handleAddTask} disabled={!selectedTrader || !taskTitle || !taskDueDate}>Add Task</Button>
        </div>
        <div>
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) =>
                  onTaskUpdate({ ...task, completed: !!checked })
                }
              />
              <span className={task.completed ? 'line-through' : ''}>
                {task.title} - {new Date(task.dueDate).toLocaleDateString()}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onTaskDelete(task.traderId, task.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
