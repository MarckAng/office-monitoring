import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function TaskManager({ divisions, onAddDivision, onUpdateDivision, onDeleteDivision, onUpdateTask, onAddTask, onDeleteTask }) {
    const getStatusColor = (status) => {
        const colors = {
            ongoing: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
            pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
            done: 'bg-green-400/10 text-green-400 border-green-400/30'
        };
        return colors[status] || colors.pending;
    };
    
    const getDueDateLabel = (dueDate) => {
        if (!dueDate) return 'No due date';
        try {
            const date = new Date(dueDate);
            if (isNaN(date)) return dueDate;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
            if (diff < 0) return `Overdue (${Math.abs(diff)}d)`;
            if (diff === 0) return 'Today';
            if (diff === 1) return 'Tomorrow';
            if (diff <= 7) return `${diff} days`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
            return dueDate;
        }
    };
    
    const getDueDateColor = (dueDate) => {
        if (!dueDate) return 'text-gray-500';
        try {
            const date = new Date(dueDate);
            if (isNaN(date)) return 'text-gray-500';
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
            if (diff < 0) return 'text-red-400';
            if (diff === 0) return 'text-yellow-400';
            if (diff === 1) return 'text-orange-400';
            return 'text-green-400';
        } catch (e) {
            return 'text-gray-500';
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={onAddDivision}
                    className="px-3 py-1.5 rounded text-xs font-mono bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20"
                >
                    <PlusIcon className="w-3 h-3 inline mr-1" /> Add Division
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {divisions.map(division => (
                <div key={division.id} className="bg-[#0c1a28] rounded-lg border border-white/5 overflow-hidden">
                    <div className="p-3 bg-[#0f2033] border-b border-white/5">
                        <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0 space-y-1">
                                <input
                                    type="text"
                                    value={division.name}
                                    onChange={(e) => onUpdateDivision(division.id, 'name', e.target.value)}
                                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
                                    placeholder="Division name"
                                />
                                <input
                                    type="text"
                                    value={division.abbr || ''}
                                    onChange={(e) => onUpdateDivision(division.id, 'abbr', e.target.value)}
                                    className="w-full bg-transparent text-xs text-gray-500 focus:outline-none"
                                    placeholder="Abbreviation"
                                />
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <button
                                    onClick={() => onAddTask(division.id)}
                                    className="p-1 rounded hover:bg-white/5 text-cyan-400"
                                    title="Add task"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDeleteDivision(division.id)}
                                    className="p-1 rounded hover:bg-red-500/10 text-red-400"
                                    title="Delete division"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                        {division.tasks?.map(task => (
                            <div key={task.id} className="flex flex-col gap-1 p-2 bg-[#0f2033] rounded-lg border border-white/5">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={task.title}
                                        onChange={(e) => onUpdateTask(division.id, task.id, 'title', e.target.value)}
                                        className="flex-1 bg-transparent text-sm text-gray-300 focus:outline-none"
                                        placeholder="Task name"
                                    />
                                    <select
                                        value={task.status}
                                        onChange={(e) => onUpdateTask(division.id, task.id, 'status', e.target.value)}
                                        className={`text-xs font-mono px-2 py-1 rounded border ${getStatusColor(task.status)} bg-transparent cursor-pointer`}
                                    >
                                        <option value="ongoing">Ongoing</option>
                                        <option value="pending">Pending</option>
                                        <option value="done">Done</option>
                                    </select>
                                    <button 
                                        onClick={() => onDeleteTask(division.id, task.id)}
                                        className="p-1 rounded hover:bg-red-500/10 text-red-400"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 ml-1">
                                    <span className="text-[10px] text-gray-500">📅 Due:</span>
                                    <input
                                        type="date"
                                        value={task.due_date || ''}
                                        onChange={(e) => onUpdateTask(division.id, task.id, 'due_date', e.target.value)}
                                        className="text-xs bg-[#0c1a28] px-2 py-1 rounded text-gray-300 border border-white/5 focus:outline-none focus:border-cyan-400"
                                    />
                                    {task.due_date && (
                                        <span className={`text-[9px] font-mono ${getDueDateColor(task.due_date)}`}>
                                            ({getDueDateLabel(task.due_date)})
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!division.tasks || division.tasks.length === 0) && (
                            <div className="text-center text-gray-500 text-sm py-4">No tasks yet. Click + to add.</div>
                        )}
                    </div>
                </div>
            ))}
            </div>
            {divisions.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">No divisions yet. Click "Add Division" to create one.</div>
            )}
        </div>
    );
}
