"use client";

import DrawArea from "@/components/client/DrawArea";

export default function DrawPage({ params }: { params: { roomId: string } }) {
  return (
    <div>
      <DrawArea width={800} height={600} isLocal={true} />
      <DrawArea width={800} height={600} isLocal={false} />
    </div>
  );
}