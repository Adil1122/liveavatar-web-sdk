"use client";

import React, { useEffect, useRef } from "react";
import {
  LiveAvatarContextProvider,
  useSession,
} from "../liveavatar";
import { SessionState, type VoiceChatConfig } from "@heygen/liveavatar-web-sdk";
import { type SessionMode } from "../liveavatar/types";

import { useChatHistory } from "../liveavatar/useChatHistory";
import { MessageSender } from "../liveavatar/types";

const LiveAvatarSessionComponent: React.FC<{
  onSessionStopped: () => void;
}> = ({ onSessionStopped }) => {
  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    attachElement,
  } = useSession();

  const messages = useChatHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Setup local WebRTC video
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function setupLocalVideo() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupLocalVideo();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
    }
  }, [attachElement, isStreamReady]);

  useEffect(() => {
    if (sessionState === SessionState.INACTIVE) {
      startSession();
    }
  }, [startSession, sessionState]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-4 bg-black overflow-hidden">
      {/* Main Container */}
      <div className="w-full max-w-5xl h-[85vh] bg-[#1a1a1c] rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 relative">

        {/* Top Section: Avatar Video */}
        <div className="relative flex-[1.5] flex items-center justify-center bg-black/20 overflow-hidden border-b border-white/5">
          {!isStreamReady ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <span className="text-white/60 font-medium text-lg tracking-wide uppercase">Initialising Avatar...</span>
            </div>
          ) : null}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-contain transition-opacity duration-700 ${isStreamReady ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Local User Preview */}
          <div className="absolute bottom-6 right-6 w-48 md:w-64 aspect-video bg-[#2a2a2c] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center group z-10">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] px-2 py-0.5 rounded-full text-white/90 font-bold uppercase tracking-widest">
              You
            </div>
          </div>
        </div>

        {/* Bottom Section: Transcript & Controls */}
        <div className="flex-1 flex flex-col bg-[#131314] overflow-hidden p-6 md:p-8">
          {/* Transcript Area */}
          <div className="flex-grow flex flex-col overflow-hidden mb-6">
            <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live Transcript
            </div>

            <div
              ref={scrollRef}
              className="flex-grow overflow-y-auto pr-4 space-y-4 custom-scrollbar"
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/10 italic text-sm">
                  Waiting for conversation to start...
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === MessageSender.USER ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm md:text-base ${msg.sender === MessageSender.USER
                      ? 'bg-purple-600/20 text-purple-100 border border-purple-500/20 rounded-tr-none'
                      : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none'
                      }`}>
                      <span className="block text-[9px] uppercase font-bold tracking-widest opacity-40 mb-1">
                        {msg.sender === MessageSender.USER ? 'Speaker' : 'Sandhurst Coach'}
                      </span>
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Controls Area */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
            <button
              onClick={() => stopSession()}
              className="group flex items-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 border border-red-500/20 active:scale-95"
            >
              <div className="w-2.5 h-2.5 bg-current rounded-[2px]" />
              STOP SESSION
            </button>

            <div className="text-[10px] text-white/20 uppercase font-black tracking-widest hidden md:block">
              Session status: <span className="text-green-500/50">Active</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .mirror {
          transform: scaleX(-1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  );
};

export const LiveAvatarSession: React.FC<{
  mode?: SessionMode;
  sessionAccessToken: string;
  onSessionStopped: () => void;
  voiceChatConfig?: boolean | VoiceChatConfig;
}> = ({
  sessionAccessToken,
  onSessionStopped,
  voiceChatConfig = true,
}) => {
    return (
      <LiveAvatarContextProvider
        sessionAccessToken={sessionAccessToken}
        voiceChatConfig={voiceChatConfig}
      >
        <LiveAvatarSessionComponent
          onSessionStopped={onSessionStopped}
        />
      </LiveAvatarContextProvider>
    );
  };
