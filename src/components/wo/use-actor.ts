import { useCurrentUser } from "@/stores/auth";
import { departmentFor } from "@/lib/wo";
import type { Actor } from "@/stores/data";

/** The current signed-in user expressed as an audit actor (name + department). */
export function useActor(): Actor {
  const user = useCurrentUser();
  return { by: user?.name ?? "System", department: departmentFor(user?.role) };
}
