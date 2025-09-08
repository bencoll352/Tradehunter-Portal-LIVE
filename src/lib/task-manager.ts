
// lib/task-manager.ts
import { Scraper } from './scraper';
import { ScrapingOptions, ScrapingResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  options: ScrapingOptions;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: ScrapingResult;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class TaskManager {
  private scraper: Scraper;
  private tasks: Map<string, Task> = new Map();
  private maxConcurrency: number;
  private runningTasks: number = 0;

  constructor(scraper: Scraper, maxConcurrency: number = 5) {
    this.scraper = scraper;
    this.maxConcurrency = maxConcurrency;
  }

  async addTask(options: ScrapingOptions): Promise<string> {
    const taskId = uuidv4();
    const task: Task = {
      id: taskId,
      options,
      status: 'pending',
      createdAt: new Date()
    };

    this.tasks.set(taskId, task);
    this.processQueue();
    
    return taskId;
  }

  private async processQueue(): Promise<void> {
    if (this.runningTasks >= this.maxConcurrency) {
      return;
    }

    const pendingTask = Array.from(this.tasks.values()).find(t => t.status === 'pending');
    if (pendingTask) {
        this.executeTask(pendingTask.id);
    }
  }

  private async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') return;

    this.runningTasks++;
    task.status = 'running';
    task.startedAt = new Date();

    try {
      const result = await this.scraper.scrape(task.options);
      task.result = result;
      task.status = 'completed';
    } catch (error) {
      task.error = error instanceof Error ? error.message : String(error);
      task.status = 'failed';
    } finally {
      task.completedAt = new Date();
      this.runningTasks--;
      this.processQueue();
    }
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
}
