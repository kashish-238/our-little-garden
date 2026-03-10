import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Landing } from "./pages/Landing";
import { Join } from "./pages/Join";
import { Garden } from "./pages/Garden";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/join/:code" component={Join} />
      <Route path="/garden/:code" component={Garden} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />

        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Router />
          </div>

          <footer className="text-center text-xs opacity-60 py-4 font-mono">
            🌱 Our Little Garden • Created by Sahil Patel • Seneca Polytechnic
          </footer>
        </div>

      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;