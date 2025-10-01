import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import taskService from '../services/taskService';
import {useToast} from "../utils/toast/toastService";

interface Task {
    propertyId: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
}

interface EditTaskFormProps {
    task: Task;
    onSubmit: () => void;
    onClose: () => void;
}

export default function EditTaskForm({ task, onSubmit, onClose }: EditTaskFormProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [isLoading, setIsLoading] = useState(false);
    const {push} = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await taskService.update(task.propertyId,{title,description});
            push({
                title: 'Task Successfully updated',
                description: response.data.message,
                variant: 'success'
            });

        } catch (error: any) {
            push({
                title: 'Task updating failed',
                description: error?.response?.data?.message || error.message || 'Something went wrong',
                variant: 'error'
            });
            console.error(error);
        }
        onSubmit();
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                                Task Title *
                            </label>
                            <input
                                id="edit-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none  transition-colors"
                                placeholder="Enter task title..."
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="edit-description"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none  transition-colors resize-none"
                                placeholder="Enter task description..."
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}