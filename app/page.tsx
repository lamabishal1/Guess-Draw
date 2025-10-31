"use client";

import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import { getUserSession } from "./services/user.service";
import { supabase } from "../app/lib/supabase";
import { Session } from "@supabase/supabase-js";
import DashboardBody from "./components/Dashboard/DashboardBody";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  function generateUserColor(): string {
    const colors = [
      "#3b82f6",
      "#14b8a6",
      "#f87171",
      "#eab308",
      "#a855f7",
      "#6366f1",
    ];
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
  }

  function createUsernameFromEmail(email: string): string {
    try {
      const username = email?.split("@")[0];
      return username;
    } catch (error) {
      throw new Error("Error occurred while creating username: " + error);
    }
  }

  useEffect(() => {
    const handleCheckSession = async (): Promise<void> => {
      try {
        const session = await getUserSession();
  
        if (session) {
          const isNewUser =
            !session?.user?.user_metadata?.userName &&
            !session?.user?.user_metadata?.userColor;
  
          if (isNewUser) {
            const userName = createUsernameFromEmail(
              session?.user?.email as string
            );
            const userColor = generateUserColor();
  
            // Update user in Supabase
            await supabase.auth.updateUser({
              data: { userName, userColor },
            });
  
            const updatedSession: Session = {
              ...session,
              user: {
                ...session.user,
                user_metadata: {
                  ...session.user.user_metadata,
                  userName,
                  userColor,
                },
              },
            };
  
            setSession(updatedSession);
          } else {
            setSession(session);
          }
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error occurred while fetching user session:", error);
        window.location.href = "/login";
      } finally {
        setIsAuthenticating(false);
      }
    };
  
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        setIsAuthenticating(false);
      } else {
        handleCheckSession();
      }
    });
  
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSession(session);
          setIsAuthenticating(false);
        }
      }
    );
  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Validating session. Please wait...</p>
      </div>
    );
  }

  console.log(session);

  return (
    <main>
      <Navbar session={session} />
      <DashboardBody session={session} />
    </main>
  );
}
