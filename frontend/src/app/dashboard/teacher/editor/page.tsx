"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { supabase } from "@/utils/supabaseClient";
import CollaborativeEditor from "@/components/CollaborativeEditor";

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
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{draft.title}</h1>
      <RoomProvider id={`draft-${draft.id}`} initialPresence={{ cursor: null }}>
        <ClientSideSuspense fallback={<div>Loading collaborative editor...</div>}>
          <CollaborativeEditor roomId={`draft-${draft.id}`} initialContent={draft.content} />
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
}
