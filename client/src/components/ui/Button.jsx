import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden";

    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg focus:ring-indigo-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:scale-[1.02] focus:ring-gray-500",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
        danger: "bg-rose-500 text-white hover:bg-rose-600 hover:scale-[1.02] hover:shadow-lg focus:ring-rose-500",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-10 px-4 py-2 text-sm rounded-lg",
        lg: "h-12 px-8 text-base rounded-xl",
    };

    return (
        <button
            ref={ref}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {/* Simple Ripple Implementation using group-hover if we wanted, but native transition handles the SaaS feel well */}
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </span>
            ) : children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
