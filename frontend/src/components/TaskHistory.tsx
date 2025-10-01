import {ArrowLeft, Filter, CheckCircle, Clock, Calendar,ChevronLeft, ChevronRight} from 'lucide-react';
import TaskCard from './TaskCard';
import {useEffect, useState} from "react";
import taskService from "../services/taskService";
import {useToast} from "../utils/toast/toastService";
import ConfirmationDialog from './ConfirmationDialog';
import EditTaskForm from "./EditTaskForm";

interface Task {
    propertyId: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
}

interface Stats {
    total: number;
    pending: number;
    completed: number;
}

interface TaskHistoryProps {
    onBack: () => void;
}

export default function TaskHistory({onBack,}: TaskHistoryProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [stats, setStats] = useState<Stats>({
        completed: 0,
        pending: 0,
        total: 0
    });
    const {push} = useToast();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limitSize] = useState<number>(5);
    const [filter, setFilter] = useState("all");
    const [query, setquery] = useState<{ page?: number, limit?: number, isComplete?: boolean }>({
        page: currentPage,
        limit: 5,
    });

    const handleAllTaskFilter = () => {
        setCurrentPage(1);
        setquery({page: currentPage, limit: limitSize});
        setFilter("all");
    }

    const handlePendingTaskFilter = () => {
        setCurrentPage(1);
        setquery({page: currentPage, limit: limitSize, isComplete: false});
        setFilter("uncompleted");
    }

    const handleCompletedTaskFilter = () => {
        setCurrentPage(1);
        setquery({page: currentPage, limit: limitSize, isComplete: true});
        setFilter("completed");
    }

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        onConfirm: () => {},
    });
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleComplete = (task: Task) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Mark Task as Complete',
            message: `Are you sure you want to mark "${task.title}" as completed?`,
            confirmText: 'Complete',
            type: 'info',
            onConfirm: async () => {
                await taskService.changeStatus(task.propertyId!, true);
                setConfirmDialog({...confirmDialog, isOpen: false});
                await fetchTasks();
                await fetchStats();
            }
        });
    };

    const handleDelete = (task: Task) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Task',
            message: `Are you sure you want to delete "${task.title}"?`,
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                await taskService.delete(task.propertyId!);
                setConfirmDialog({...confirmDialog, isOpen: false});
                await fetchTasks();
                await fetchStats();
            }
        });
    };

    const handleEdit = (task: Task) => setEditingTask(task);

    const handlePrevPage = () => {
        setCurrentPage(currentPage - 1);
    }

    const handleNextPage = () => {
        setCurrentPage(currentPage + 1);
    }


    const fetchTasks = async () => {
        try {
            const response = await taskService.getList(query);
            const taskList: Task[] = response.data.data.dataList;
            setTasks(taskList);
            setTotalPages(response.data.data.pagination.totalPages)
            push({title: 'Fetching Successfully', description: response.data.message, variant: 'success'});
        } catch (error: any) {
            push({
                title: 'Fetching failed',
                description: error?.response?.data?.message || error.message || 'Something went wrong',
                variant: 'error'
            });
            console.log(error);
        }
    }

    const fetchStats = async () => {
        try {
            const response = await taskService.getStats();
            const stats: Stats = response.data.data;
            setStats(stats);
            push({title: 'Fetching Successfully', description: response.data.message, variant: 'success'});
        } catch (error: any) {
            push({
                title: 'Fetching failed',
                description: error?.response?.data?.message || error.message || 'Something went wrong',
                variant: 'error'
            });
            console.log(error);
        }
    }

    useEffect(() => {
        setquery(prev => ({
            ...prev,
            page: currentPage,
            limit: limitSize,
        }));
    }, [currentPage, limitSize]);


    useEffect(() => {
        fetchTasks();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, currentPage]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5"/>
                                <span>Back to Dashboard</span>
                            </button>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="h-8 w-8 text-indigo-600"/>
                            <h1 className="text-2xl font-bold text-gray-900">Task History</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Calendar className="h-6 w-6 text-purple-600"/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                                <p className="text-gray-600">Total Tasks</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-emerald-600"/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.completed}</h3>
                                <p className="text-gray-600">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Clock className="h-6 w-6 text-amber-600"/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
                                <p className="text-gray-600">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center space-x-4 mb-8">
                    <div className="flex items-center space-x-2 text-gray-700">
                        <Filter className="h-5 w-5"/>
                        <span className="font-medium">Filter:</span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleAllTaskFilter()}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            All Tasks ({stats.total})
                        </button>
                        <button
                            onClick={() => handlePendingTaskFilter()}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'uncompleted'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            Pending ({stats.pending})
                        </button>
                        <button
                            onClick={() => handleCompletedTaskFilter()}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'completed'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            Completed ({stats.completed})
                        </button>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div
                                className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                {filter === 'completed' ? (
                                    <CheckCircle className="h-8 w-8 text-gray-400"/>
                                ) : filter === 'uncompleted' ? (
                                    <Clock className="h-8 w-8 text-gray-400"/>
                                ) : (
                                    <Calendar className="h-8 w-8 text-gray-400"/>
                                )}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No {filter === 'all' ? '' : filter} tasks found
                            </h3>
                            <p className="text-gray-600">
                                {filter === 'completed' && 'You haven\'t completed any tasks yet.'}
                                {filter === 'uncompleted' && 'You have no pending tasks. Great work!'}
                                {filter === 'all' && 'You haven\'t created any tasks yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-6">

                                <h3 className="text-xl font-semibold text-gray-900">
                                    {filter === 'all' && 'All Tasks'}
                                    {filter === 'completed' && 'Completed Tasks'}
                                    {filter === 'uncompleted' && 'Pending Tasks'}
                                </h3>

                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500">
                                      {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                                    </span>

                                    <span className="text-sm text-gray-500">
                                      Page {currentPage} of {totalPages}
                                    </span>


                                    <div className="flex items-center border border-gray-500 space-x-1 p-1 rounded">
                                        <button
                                            className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                                            onClick={() => handlePrevPage()}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                                            onClick={() => handleNextPage()}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {tasks.map((task) => (
                                <TaskCard
                                    key={task.propertyId}
                                    task={task}
                                    onComplete={() => handleComplete(task)}
                                    onDelete={() => handleDelete(task)}
                                    onEdit={!task.completed ? () => handleEdit(task) : undefined}
                                />

                            ))}
                        </div>
                    )}
                </div>
            </div>

            {editingTask && (
                <EditTaskForm
                    task={editingTask}
                    onSubmit={async () => {
                        setEditingTask(null);
                        await fetchTasks();
                    }}
                    onClose={() => setEditingTask(null)}
                />
            )}

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                onConfirm={confirmDialog.onConfirm}
                type={confirmDialog.type}
                onCancel={() => setConfirmDialog({...confirmDialog, isOpen: false})}
            />

        </div>
    );
}