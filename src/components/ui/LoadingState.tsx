import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function LoadingState({ 
  message = "Analisando sua foto...", 
  submessage = "Nossa IA está identificando os ingredientes",
  className 
}: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6", className)}>
      {/* Animated circles */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-muted animate-pulse" />
        <div 
          className="absolute inset-2 rounded-full border-4 border-t-chef-dark border-r-transparent border-b-transparent border-l-transparent animate-spin"
          style={{ animationDuration: '1s' }}
        />
        <div 
          className="absolute inset-4 rounded-full border-4 border-b-chef-accent border-r-transparent border-t-transparent border-l-transparent animate-spin"
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-chef-dark flex items-center justify-center">
            <span className="text-2xl">🍳</span>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="font-semibold text-lg text-foreground mb-1">
          {message}
        </p>
        <p className="text-sm text-muted-foreground">{submessage}</p>
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-chef-dark"
            style={{ 
              animation: 'pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
