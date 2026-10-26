import { signOut } from "@/app/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="text-sm text-muted underline">Sign out</button>
    </form>
  );
}
