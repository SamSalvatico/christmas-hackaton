'use client';

import { useState } from 'react';

interface AIInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export function AIInput({ onSubmit, isLoading = false }: AIInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium mb-2">
          Enter your prompt:
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What would you like the AI to process?"
          className="w-full p-3 border rounded-lg resize-none"
          rows={4}
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Process with AI'}
      </button>
    </form>
  );
}

