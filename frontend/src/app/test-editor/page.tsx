"use client";

import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import CollaborativeEditor from "@/components/CollaborativeEditor";

export default function TestEditorPage() {
  return (
    <RoomProvider id="lesson-demo" initialPresence={{ cursor: null }}>
      <ClientSideSuspense fallback={<div>Loading editor…</div>}>
        <CollaborativeEditor roomId="lesson-demo" />
      </ClientSideSuspense>
    </RoomProvider>
  );
}