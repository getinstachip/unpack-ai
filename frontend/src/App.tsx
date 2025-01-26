import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "@/components/Layout";
import Analysis from "./pages/Analysis";
import CodeEditorPage from "./pages/CodeEditor";
import type { ProcessedFile } from '@/components/FileUpload';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Analysis />,
      },
      {
        path: "/editor",
        element: <CodeEditorPage />,
      },
      {
        path: "/editor/:fileId",
        element: <CodeEditorPage />,
      }
    ]
  }
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}