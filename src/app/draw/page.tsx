import DrawArea from "@/components/client/DrawArea";
import Toolbar from "@/components/client/Toolbar";

export default function Page() {
    return (
        <main>
            <section className="mx-auto flex max-w-7xl flex-col gap-3 py-3">
                <Toolbar />
                <div className="">
                    <DrawArea width={800}
                        height={400}
                        isLocal={true}/>
                </div>
            </section>
        </main>
    );
}
