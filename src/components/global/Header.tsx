import { Akaya_Kanadaka } from "next/font/google";
import Link from "next/link";

const logoFont = Akaya_Kanadaka({
  weight: "400",
  subsets: ["latin"],
});

export default function Header() {
  return (
    <header className="fixed top-0 h-14 w-full bg-purple-900 text-white z-50">
      <section className="mx-auto flex h-full max-w-7xl items-center px-3">
        <Link href={"/"} className={`${logoFont.className} text-3xl`}>
          DuoPaint
        </Link>
      </section>
    </header>
  );
}
