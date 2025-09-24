import { CheckCircle, Trash2, Calendar,Pencil } from 'lucide-react';

interface Task {
    propertyId: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
}

interface TaskCardProps {
    task: Task;
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
    const formatDate = (date: string | Date) => {
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(parsedDate);
    };


    const formatTimeAgo = (date: string | Date) => {
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        if (diffInMinutes < 120) return '1 hour ago';
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        if (diffInMinutes < 2880) return 'Yesterday';
        return formatDate(parsedDate);
    };


    return (
        <div className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
            task.completed
                ? 'bg-emerald-50 border-emerald-200 opacity-75'
                : 'bg-white border-gray-200 hover:border-indigo-300'
        }`}>
            <div className="flex items-start justify-between">
                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                    <h4 className={`font-semibold mb-1 ${
                        task.completed
                            ? 'text-gray-600 line-through'
                            : 'text-gray-900'
                    }`}>
                        {task.title}
                    </h4>

                    {task.description && (
                        <p className={`text-sm mb-3 ${
                            task.completed
                                ? 'text-gray-500 line-through'
                                : 'text-gray-600'
                        }`}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created {formatTimeAgo(task.createdAt)}</span>
                        </div>
                        {task.completed && task.completedAt && (
                            <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Completed {formatTimeAgo(task.completedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    {!task.completed && (
                        <>

                            <button
                                onClick={() => onComplete(task.propertyId)}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
                            >
                                Done
                            </button>

                            {onEdit && (
                                <button
                                    onClick={() => onEdit(task)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                    title="Edit task"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                            )}

                        </>
                    )}
                    <button
                        onClick={() => onDelete(task.propertyId)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete task"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}