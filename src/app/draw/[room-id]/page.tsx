"use client";

import DrawArea from "@/components/client/DrawArea";
import Toolbar from "@/components/client/Toolbar";

export default function DrawPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-3 py-3">
      <Toolbar/>
      <DrawArea width={800} height={300} isLocal={true} />
      <DrawArea width={800} height={300} isLocal={false} />
    </div>
  );
}