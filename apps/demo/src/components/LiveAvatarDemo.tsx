"use client";

import { useMemo, useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import { SessionInteractivityMode } from "@heygen/liveavatar-web-sdk";
import { type SessionMode } from "../liveavatar/types";

export const LiveAvatarDemo = () => {
  const [sessionToken, setSessionToken] = useState("");
  const [mode, setMode] = useState<SessionMode>("FULL");
  const [error, setError] = useState<string | null>(null);

  const handleStartFullSession = async (pushToTalk: boolean = false) => {
    try {
      const res = await fetch("/api/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pushToTalk }),
      });
      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to start full session", error);
        setError(error.error);
        return;
      }
      const { session_token } = await res.json();
      setSessionToken(session_token);
      setMode(pushToTalk ? "FULL_PTT" : "FULL");
    } catch (error: unknown) {
      setError((error as Error).message);
    }
  };


  const onSessionStopped = () => {
    // Reset the FE state
    setSessionToken("");
  };

  const voiceChatConfig = useMemo(() => {
    if (mode === "FULL_PTT") {
      return {
        mode: SessionInteractivityMode.PUSH_TO_TALK,
      };
    }
    return true;
  }, [mode]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-4">
      {!sessionToken ? (
        <div className="w-full max-w-4xl aspect-[16/10] bg-[#1a1a1c] rounded-[2rem] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/5">
          {/* Main Content Area */}
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#1a1a1c] to-[#18181b]">
            {error && (
              <div className="mb-6 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {"Error: " + error}
              </div>
            )}

            <h1 className="text-white text-2xl md:text-3xl font-medium tracking-tight opacity-90">
              Ready to start chat with Sandhurst Coach
            </h1>
          </div>

          {/* Footer with Buttons */}
          <div className="bg-[#131314] p-8 md:p-10 flex flex-wrap justify-center items-center gap-4 border-t border-white/5">
            <button
              onClick={() => handleStartFullSession(false)}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] shadow-xl shadow-purple-500/10 text-sm md:text-base border border-white/5"
            >
              Start Full Mode Avatar Session
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <LiveAvatarSession
            mode={mode}
            sessionAccessToken={sessionToken}
            voiceChatConfig={voiceChatConfig}
            onSessionStopped={onSessionStopped}
          />
        </div>
      )}
    </div>
  );
};
