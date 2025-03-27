import DrawArea from "@/components/client/DrawArea";
import Toolbar from "@/components/client/Toolbar";

export default async function Page({
    params,
}: {
    params: Promise<{ roomId: string }>;
}) {
    const { roomId } = await params;
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-3 py-3 bg-slate-50">
            <div>{roomId}</div>
            <Toolbar />
            <DrawArea width={800} height={300} isLocal={true} />
            <DrawArea width={800} height={300} isLocal={false} />
        </div>
    );
}
