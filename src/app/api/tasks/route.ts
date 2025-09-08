
// app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { taskManager } from '@/lib/global-task-manager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taskId = await taskManager.addTask(body);
    return NextResponse.json({ taskId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('id');

  if (taskId) {
    const task = taskManager.getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task);
  }

  return NextResponse.json(taskManager.getAllTasks());
}
