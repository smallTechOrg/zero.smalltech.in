"use client";
import { Suspense } from "react";
import Chat from "./widget";

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Chat />
    </Suspense>
  );
}
