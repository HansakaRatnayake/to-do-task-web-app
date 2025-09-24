import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, BarChart3 } from 'lucide-react';

export default function HomePage() {

    const scrollToSection = (href:any) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-8 w-8 text-indigo-600" />
                        <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <div onClick={() => scrollToSection('#features')} className="text-gray-600 hover:text-indigo-600 transition-colors hover:cursor-pointer">Features</div>
                        {/*<div onClick={() => scrollToSection('#about')} className="text-gray-600 hover:text-indigo-600 transition-colors">About</div>*/}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen px-6 py-24 flex flex-col item-center justify-center">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                            Organize Your
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Tasks</span>
                            <br />Like Never Before
                        </h1>
                        <p className="text-lg md:text-lg text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
                            Experience the future of task management with our elegant, intuitive platform designed to boost your productivity and streamline your workflow.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/login"
                                className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transform hover:scale-105 transition-all duration-200"
                            >
                                Access Your Tasks
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="px-6 py-24 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
                        <p className="text-md text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed to help you manage tasks efficiently and boost your productivity.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Task Management</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Create, organize, and track tasks with intelligent categorization and priority management.
                            </p>
                        </div>
                        <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <Calendar className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Timeline View</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Visualize your tasks and deadlines with beautiful timeline and calendar views.
                            </p>
                        </div>
                        <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <BarChart3 className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Progress Analytics</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Track your productivity with detailed analytics and insights about your task completion.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 px-6 py-12">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <CheckCircle className="h-6 w-6 text-indigo-600" />
                        <span className="text-xl font-semibold text-gray-900">TaskFlow</span>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Streamline your productivity with intelligent task management.
                    </p>
                    <div className="flex justify-center space-x-6">
                        <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Privacy</a>
                        <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Terms</a>
                        <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Support</a>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-gray-500 text-sm">
                            © 2025 TaskFlow. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}