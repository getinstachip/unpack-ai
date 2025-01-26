import React from 'react';

export const LoadingView = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-foreground">Processing Files...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we analyze your code</p>
      </div>
    </div>
  );
};