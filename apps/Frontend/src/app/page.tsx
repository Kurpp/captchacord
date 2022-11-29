import Link from "next/link";

export default function Home() {
  return (
    <Link href={`${process.env.API_URL}/discord/login`}>
    <button className="tw-text-7xl tw-font-bold tw-bg-slate-500">Login</button>
    </Link>
  );
}
