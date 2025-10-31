"use client";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import Image from "next/image";
import LoginPagePic from "@/public/loginpagepic.png"

const LoginPage = () => {
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTokenSent, setIsTokenSent] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const authenticateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!emailAddress) {
      setError("Email address is required");
      return;
    }

    setIsLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithOtp({
      email: emailAddress,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    if (data) {
      setIsTokenSent(true);
      setEmailAddress("");
      setTimeout(() => {
        setIsTokenSent(false);
        setIsLoading(false);
      }, 5000);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (googleError) {
      setError(googleError.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
<div className="flex flex-col gap-6 items-center w-full max-w-2xl mx-auto px-8">        <Image
          src={LoginPagePic}
          alt="logo"
          width={200}
          height={200}
        />

        <label className="text-3xl font-bold">Sign In</label>

        {error && (
          <div className="w-full px-3 py-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm animate-shake">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="w-full flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-slate-300"></div>
          <span className="text-sm text-slate-600">or</span>
          <div className="flex-1 h-px bg-slate-300"></div>
        </div>

        <form onSubmit={authenticateUser} className="w-full flex flex-col gap-3">
          <label className="text-base font-semibold text-slate-700">Login with Mail</label>
          <input
            type="email"
            placeholder="Enter email address"
            className="border border-slate-200 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            onChange={(e) => setEmailAddress(e.target.value)}
            value={emailAddress}
            disabled={isTokenSent || isLoading}
          />
          <button
            type="submit"
            className={`px-3 py-2 bg-slate-900 text-white rounded-lg text-base w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors ${
              isTokenSent ? "animate-pulse bg-green-600 hover:bg-green-600" : ""
            }`}
            disabled={isTokenSent || isLoading}
          >
            {isTokenSent ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Token sent—check your email
              </span>
            ) : isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                One moment please...
              </span>
            ) : (
              "Send link"
            )}
          </button>
        </form>

        {isTokenSent && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-scale-up">
              <svg className="w-20 h-20 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          @keyframes scale-up {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-shake {
            animation: shake 0.5s;
          }
          .animate-scale-up {
            animation: scale-up 0.6s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoginPage;