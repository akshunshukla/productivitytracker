import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Panel: Branding and Motivation */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col items-center justify-center p-12 text-center relative">
        {/* Abstract Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/auth-background.png')" }}
        ></div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">FocusFlow</h1>
          <p className="text-xl text-gray-300">Your Progress, Quantified.</p>
        </div>
      </div>

      {/* Right Panel: Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
