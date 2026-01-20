import React from 'react';

interface LoaderProps {
    message?: string;
    fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ message = "Procesando...", fullScreen = false }) => {
    const loaderContent = (
        <div className="flex flex-col items-center justify-center gap-6 animate-pop">
            <div className="relative">
                <div className="loader-ring"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                </div>
            </div>
            {message && (
                <div className="bg-white/80 backdrop-blur-md py-3 px-8 rounded-full border border-primary-soft shadow-lg">
                    <p className="text-primary font-black text-sm uppercase tracking-widest text-center">
                        {message}
                    </p>
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
};

export default Loader;
