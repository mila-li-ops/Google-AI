import { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  // Functional components cannot be Error Boundaries yet in React.
  // This is a placeholder that renders children.
  // In a real app, you'd use a class component or a library like react-error-boundary.
  return <>{children}</>;
};
