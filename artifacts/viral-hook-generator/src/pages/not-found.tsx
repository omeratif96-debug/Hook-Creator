import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={`${import.meta.env.BASE_URL}images/gradient-bg.png`}
          alt="Background"
          className="w-full h-full object-cover opacity-30 mix-blend-multiply dark:mix-blend-screen"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center bg-card/50 backdrop-blur-xl p-12 rounded-[2rem] border border-white/20 shadow-2xl"
      >
        <h1 className="text-8xl md:text-9xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-primary to-pink-500 mb-6 drop-shadow-sm">
          404
        </h1>
        <h2 className="text-3xl font-bold text-foreground mb-4">You've strayed off script!</h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist. Let's get you back to creating viral content.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
        >
          <ArrowLeft size={20} />
          Back to Generator
        </Link>
      </motion.div>
    </div>
  );
}
