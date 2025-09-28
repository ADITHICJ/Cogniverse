"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { supabase } from "@/utils/supabaseClient";
import CollaborativeEditor from "@/components/CollaborativeEditor";
import HistorySidebar from "@/components/HistorySidebar";

export default function EditorPage() {
  const params = useParams();
  const draftId = params.id as string;

  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraft = async () => {
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .eq("id", draftId)
        .single();

      if (error) {
        console.error("Error fetching draft:", error);
      } else {
        setDraft(data);
      }
      setLoading(false);
    };

    fetchDraft();
  }, [draftId]);

  if (loading) return <p>Loading draft...</p>;
  if (!draft) return <p>Draft not found</p>;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Collaborative Editor */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-xl font-bold mb-4">{draft.title}</h1>
        <RoomProvider id={`draft-${draft.id}`} initialPresence={{ cursor: null }}>
          <ClientSideSuspense fallback={<div>Loading collaborative editor...</div>}>
            <CollaborativeEditor roomId={`draft-${draft.id}`} initialContent={draft.content} />
          </ClientSideSuspense>
        </RoomProvider>
      </div>

      {/* Sidebar - Draft History */}
      <div className="w-80 border-l bg-red-100 overflow-auto min-h-full">
        <div className="p-4 border-2 border-red-500">
          <p className="text-red-800 font-bold">SIDEBAR TEST - Draft ID: {draft.id}</p>
          <HistorySidebar draftId={draft.id} />
        </div>
      </div>
    </div>
  );
}
