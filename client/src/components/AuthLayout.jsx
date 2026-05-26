const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 text-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-chart-2/10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-chart-2/5 blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-gradient mb-3">FocusFlow</h1>
          <p className="text-xl text-muted-foreground">
            Your Progress, Quantified.
          </p>
          <div className="mt-8 flex items-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Track Time
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2" />
              Set Goals
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-3" />
              Get Insights
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
