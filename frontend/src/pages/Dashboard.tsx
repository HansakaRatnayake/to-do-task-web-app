import {useState, useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import {Plus, CheckCircle, Clock, Archive, User, LogOut, Calendar, Menu, X} from 'lucide-react';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import TaskHistory from '../components/TaskHistory';
import taskService from '../services/taskService';
import {useToast} from '../utils/toast/toastService';
import EditTaskForm from '../components/EditTaskForm';
import ConfirmationDialog from '../components/ConfirmationDialog';

interface Task {
    propertyId?: string;
    title: string;
    description: string;
    completed?: boolean;
    createdAt?: Date;
    completedAt?: Date;
}

interface Stats {
    total: number;
    pending: number;
    completed: number;
}

export default function Dashboard() {
    const {user, logout} = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<Stats>({
        completed: 0,
        pending: 0,
        total: 0
    });
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
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
    const {push} = useToast();

    const fetchTasks = async () => {
        try {
            const response = await taskService.getList({page:1,limit:5,isComplete:false});
            const taskList: Task[] = response.data.data.dataList;
            setTasks(taskList);
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

    const handleAddTask = async (taskData: { title: string; description: string }) => {
        try {
            const response = await taskService.create(taskData);
            push({
                title: 'Adding Successfully',
                description: response.data.message,
                variant: 'success'
            });
            await fetchTasks();
            await fetchStats();
            setShowTaskForm(false);
        } catch (error: any) {
            push({
                title: 'Adding failed',
                description: error?.response?.data?.message || error.message || 'Something went wrong',
                variant: 'error'
            });
            console.error(error);
        }
    };

    const handleCompleteTask = (taskId: string) => {
        const task = tasks.find(t => t.propertyId === taskId);
        if (!task) return;

        setConfirmDialog({
            isOpen: true,
            title: 'Mark Task as Complete',
            message: `Are you sure you want to mark "${task.title}" as completed? This action will move the task to your completed list.`,
            confirmText: 'Mark Complete',
            type: 'info',
            onConfirm: async () => {
                try {
                    const response = await taskService.changeStatus(taskId,true);
                    push({
                        title: 'Task Mark as Completed',
                        description: response.data.message,
                        variant: 'success'
                    });
                    await fetchTasks();
                    await fetchStats();

                } catch (error: any) {
                    push({
                        title: 'Task Mark as Completing failed',
                        description: error?.response?.data?.message || error.message || 'Something went wrong',
                        variant: 'error'
                    });
                    console.error(error);
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    };


    const handleDeleteTask = (taskId: string) => {
        const task = tasks.find(t => t.propertyId === taskId);
        if (!task) return;

        setConfirmDialog({
            isOpen: true,
            title: 'Delete Task',
            message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
            confirmText: 'Delete Task',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const response = await taskService.delete(taskId);
                    push({
                        title: 'Task Deleted',
                        description: response.data.message,
                        variant: 'success'
                    });
                    await fetchTasks();
                    await fetchStats();

                } catch (error: any) {
                    push({
                        title: 'Failed deleting task',
                        description: error?.response?.data?.message || error.message || 'Something went wrong',
                        variant: 'error'
                    });
                    console.error(error);
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
    };

    const handleUpdateTask = async () => {
        setEditingTask(null);
        await fetchTasks();
    };

    const handleBackFromHistory = () => {
        setShowHistory(false);
        setEditingTask(null);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
    };

    const handleLogout = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Logout Session',
            message: `Are you sure you want to logout from this session?`,
            confirmText: 'Logout',
            type: 'warning',
            onConfirm: async () => {
                logout();
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    }

    useEffect(() => {
        fetchTasks();
        fetchStats();
    }, []);

    if (showHistory) {
        return (
            <TaskHistory
                onBack={handleBackFromHistory}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="h-8 w-8 text-indigo-600"/>
                            <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-gray-700">
                                <User className="h-5 w-5"/>
                                <span className="font-medium">{user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="h-5 w-5"/>
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                {showMobileMenu ? (
                                    <X className="h-6 w-6"/>
                                ) : (
                                    <Menu className="h-6 w-6"/>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {showMobileMenu && (
                        <div className="md:hidden border-t border-gray-200/50 bg-white/90 backdrop-blur-lg">
                            <div className="px-4 py-4 space-y-4">
                                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                                    <div
                                        className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-indigo-600"/>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user?.username}</p>
                                        <p className="text-sm text-gray-600">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowMobileMenu(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="h-5 w-5"/>
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.username}!
                    </h2>
                    <p className="text-gray-600 text-lg">
                        You have {stats.pending} pending tasks to complete.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Clock className="h-6 w-6 text-indigo-600"/>
                            </div>
                            <div>
                                <h3 data-testid="pending-count" className="text-2xl font-bold text-gray-900">
                                    {stats.pending}
                                </h3>
                                <p className="text-gray-600">Pending Tasks</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-emerald-600"/>
                            </div>
                            <div>
                                <h3 data-testid="completed-count" className="text-2xl font-bold text-gray-900">
                                    {stats.completed}
                                </h3>

                                <p className="text-gray-600">Completed Tasks</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Calendar className="h-6 w-6 text-purple-600"/>
                            </div>
                            <div>
                                <h3 data-testid="total-count" className="text-2xl font-bold text-gray-900">
                                    {stats.total}
                                </h3>
                                <p className="text-gray-600">Total Tasks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <button
                        onClick={() => setShowTaskForm(true)}
                        className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                        <Plus className="h-5 w-5"/>
                        <span>Add New Task</span>
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="flex items-center justify-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 border border-gray-200 transition-colors"
                    >
                        <Archive className="h-5 w-5"/>
                        <span>View Task History</span>
                    </button>
                </div>

                {/* Recent Tasks */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Recent Uncompleted Tasks</h3>
                        {stats.pending > 5 && (
                            <button
                                onClick={() => setShowHistory(true)}
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                View All
                            </button>
                        )}
                    </div>

                    {stats.pending === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h4>
                            <p className="text-gray-600 mb-6">You have no pending tasks. Great work!</p>
                            <button
                                onClick={() => setShowTaskForm(true)}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Add New Task
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <TaskCard
                                    key={task.propertyId}
                                    task={{
                                        propertyId: task.propertyId!,
                                        title: task.title!,
                                        description: task.description!,
                                        completed: task.completed!,
                                        createdAt: task.createdAt!
                                    }}
                                    onComplete={handleCompleteTask}
                                    onDelete={handleDeleteTask}
                                    onEdit={handleEditTask}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>


            {showTaskForm && (
                <TaskForm
                    onSubmit={handleAddTask}
                    onClose={() => setShowTaskForm(false)}
                />
            )}

            {/* Edit Task Form Modal */}
            {editingTask && (
                <EditTaskForm
                    task={{
                        propertyId: editingTask.propertyId!,
                        title: editingTask.title!,
                        description: editingTask.description!,
                        completed: editingTask.completed!,
                        createdAt: editingTask.createdAt!
                    }}
                    onSubmit={handleUpdateTask}
                    onClose={() => setEditingTask(null)}
                />
            )}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                type={confirmDialog.type}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />
        </div>
    );
}