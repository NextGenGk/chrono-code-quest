
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { ClerkAuthProvider } from "@/contexts/ClerkContext";
import CodeEditor from "./components/CodeEditor";
import ClerkAuthPage from "./components/auth/ClerkAuthPage";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <ClerkAuthPage />;
  }

  return <CodeEditor />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClerkAuthProvider>
        <AuthenticatedApp />
      </ClerkAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
