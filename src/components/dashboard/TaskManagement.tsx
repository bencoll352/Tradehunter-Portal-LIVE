
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface TaskManagementProps {
  traderId: string;
  tasks: Task[];
  onTaskCreate: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  traderId,
  tasks,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const handleAddTask = () => {
    if (taskTitle && taskDueDate) {
      const newTask: Task = {
        id: uuidv4(),
        traderId,
        title: taskTitle,
        dueDate: new Date(taskDueDate).toISOString(),
        completed: false,
      };
      onTaskCreate(newTask);
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
        <div className="flex gap-2 mb-4">
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
          <Button onClick={handleAddTask}>Add Task</Button>
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
                onClick={() => onTaskDelete(task.id)}
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
