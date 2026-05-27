import Link from "next/link";

type Props = {
  userId: number | null | undefined;
  displayName: string | null | undefined;
  email: string | null | undefined;
};

export default function UserCell({ userId, displayName, email }: Props) {
  const name = displayName ?? email ?? "—";
  const showEmail = email && email !== name;

  const inner = (
    <div className="min-w-0">
      <p className="text-text-primary text-sm font-medium truncate group-hover:text-primary transition-colors">
        {name}
      </p>
      {showEmail && <p className="text-text-secondary text-xs truncate">{email}</p>}
    </div>
  );

  if (userId == null) {
    return inner;
  }

  return (
    <Link href={`/users/${userId}`} className="group block min-w-0">
      {inner}
    </Link>
  );
}
