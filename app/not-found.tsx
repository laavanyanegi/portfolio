import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <h1 className="font-pixel text-3xl">Wrong door</h1>
      <p className="mt-2">That page does not exist.</p>
      <Link href="/" className="mt-4 inline-block underline">
        Back to the room
      </Link>
    </div>
  );
}
