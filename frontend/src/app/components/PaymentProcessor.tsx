import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, CreditCard, Building2, Share2, LucideIcon } from 'lucide-react';

interface Step {
    title: string;
    duration: number;
    icon: LucideIcon;
}

interface Steps {
    VALIDATING: Step;
    PROCESSING: Step;
    CONFIRMING: Step;
    COMPLETED: Step;
}

interface PaymentProcessorProps {
    onComplete: () => void | Promise<void>;
    onError: (error: Error) => void | Promise<void>;
}

const STEPS: Steps = {
    VALIDATING: {
        title: 'Validando información',
        duration: 2000,
        icon: CreditCard
    },
    PROCESSING: {
        title: 'Procesando pago',
        duration: 3000,
        icon: Building2
    },
    CONFIRMING: {
        title: 'Confirmando transacción',
        duration: 1500,
        icon: Share2
    },
    COMPLETED: {
        title: 'Pago completado',
        duration: 500,
        icon: Check
    }
} as const;

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ onComplete, onError }) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const steps = Object.keys(STEPS) as Array<keyof typeof STEPS>;

    const processPayment = async () => {
        try {
            for (let i = 0; i < steps.length - 1; i++) {
                setCurrentStep(i);
                const currentStepKey = steps[i];
                const stepDuration = STEPS[currentStepKey].duration;
                await new Promise(resolve => setTimeout(resolve, stepDuration));
            }
            setCurrentStep(steps.length - 1);
            await onComplete();
        } catch (err) {
            const errorMessage = 'Ha ocurrido un error durante el proceso';
            setError(errorMessage);
            onError(err instanceof Error ? err : new Error(errorMessage));
        }
    };

    useEffect(() => {
        processPayment();
    }, []);

    const progressPercentage = ((currentStep + 1) / steps.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg"
        >
            <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
                <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="space-y-6">
                {steps.map((step, index) => {
                    const StepIcon = STEPS[step].icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="flex items-center space-x-4"
                        >
                            <div className="relative">
                                <motion.div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'
                                    }`}
                                    animate={{
                                        scale: isActive ? [1, 1.1, 1] : 1
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: isActive ? Infinity : 0
                                    }}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6 text-white" />
                                    ) : isActive ? (
                                        <AnimatePresence>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Loader2 className="w-6 h-6 text-white" />
                                            </motion.div>
                                        </AnimatePresence>
                                    ) : (
                                        <StepIcon className="w-6 h-6 text-gray-500" />
                                    )}
                                </motion.div>
                            </div>

                            <div className="flex-1">
                                <p className={`font-medium ${
                                    isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-500'
                                }`}>
                                    {STEPS[step].title}
                                </p>
                                {isActive && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-gray-500"
                                    >
                                        Por favor espere...
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 p-4 bg-red-100 text-red-600 rounded-lg"
                >
                    {error}
                </motion.div>
            )}
        </motion.div>
    );
};

export default PaymentProcessor;