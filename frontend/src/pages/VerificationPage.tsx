import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export default function VerificationPage() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { verifyEmail, resendOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {};

    // Resend timer
    const [resendDisabled, setResendDisabled] = useState(true);
    const [resendCountdown, setResendCountdown] = useState(60);

    // Initialize countdown on mount
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendDisabled) {
            timer = setInterval(() => {
                setResendCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendDisabled]);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            setError('Please enter the complete verification code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await verifyEmail(email, Number(verificationCode));
            navigate('/login');
        } catch (err) {
            setError('Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setResendDisabled(true);
        setResendCountdown(60); // reset countdown
        await resendOTP(email);
        console.log('Resending verification code...');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <div className="mb-8">
                    <Link
                        to="/signup"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Sign Up</span>
                    </Link>
                </div>

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2">
                        <CheckCircle className="h-8 w-8 text-indigo-600 " />
                        <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
                    </div>
                </div>

                {/* Verification Form */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                        <p className="text-gray-600">
                            We've sent a 6-digit verification code to your email address. Please enter it below to verify your account.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                                Enter Verification Code
                            </label>
                            <div className="flex justify-center space-x-3 ">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none  transition-colors"
                                        placeholder="0"
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Verifying...
                                </div>
                            ) : (
                                'Verify Email'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 mb-2">Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={resendDisabled}
                            className={`font-medium ${
                                resendDisabled
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-indigo-600 hover:text-indigo-700'
                            }`}
                        >
                            {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
