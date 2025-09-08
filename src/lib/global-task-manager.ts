
// lib/global-task-manager.ts
import { Scraper } from './scraper';
import { TaskManager } from './task-manager';

const scraper = new Scraper();
export const taskManager = new TaskManager(scraper);
