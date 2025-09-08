'use client';

import { useState, useEffect } from 'react';
import { ScrapingOptions } from '@/types';
import { Task } from '@/lib/task-manager';

export default function ScraperDashboard() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleScrape = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if(response.ok) {
        setResults(data);
      } else {
        setResults({ error: data.error, details: data.details });
      }
    } catch (error) {
      console.error('Error:', error);
       setResults({ error: 'An unexpected error occurred.' });
    }
    setLoading(false);
  };
  
    const handleCreateTask = async () => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      fetchTasks(); // Refresh tasks list
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Botasaurus Scraper</h1>
      
      <div className="mb-8 p-4 border rounded-lg">
        <div className='flex flex-wrap gap-2 items-end'>
          <div className='flex-grow'>
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
                URL to Scrape
            </label>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="border p-2 rounded-md w-full"
              required
            />
          </div>
          <button 
            onClick={handleScrape}
            disabled={loading || !url}
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
          >
            {loading ? 'Scraping...' : 'Scrape Now'}
          </button>
          <button 
            onClick={handleCreateTask}
            disabled={!url}
            className="bg-green-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
          >
            Add to Queue
          </button>
        </div>
      </div>

      {results && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Task Queue</h2>
        <div className="space-y-2">
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className="border p-3 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium truncate" title={task.options.url}>{task.options.url}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'failed' ? 'bg-red-100 text-red-800' :
                  task.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status}
                </span>
              </div>
              <div className='text-xs text-gray-500 mt-1'>
                Task ID: {task.id} | Created: {new Date(task.createdAt).toLocaleString()}
              </div>
              {task.result && (
                <div className="mt-2 text-sm text-gray-600">
                  Response time: {task.result.metadata.responseTime}ms
                </div>
              )}
              {task.error && (
                <div className="mt-2 text-sm text-red-600">
                  Error: {task.error}
                </div>
              )}
            </div>
          )) : <p className='text-gray-500'>No tasks in the queue.</p>}
        </div>
      </div>
    </div>
  );
}
