import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/fade-in";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { listManagedUsers, listRoleChangeAudits } from "@/lib/auth/role-management";
import { AdminUsersConsoleTabs } from "@/features/admin/users/AdminUsersConsoleTabs";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!hasPermission(session.user.role, "users.roles.manage")) redirect("/dashboard");

  const users = await listManagedUsers();
  const audits = await listRoleChangeAudits(100);

  return (
    <main className="min-h-0 py-8 sm:py-10 lg:py-12 bg-transparent">
      <Container>
        <FadeIn>
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Console
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage roles with enterprise-grade safeguards and clear audit-ready
              workflows.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.06}>
          <AdminUsersConsoleTabs
            currentUserId={session.user.id}
            initialUsers={users.map((u) => ({
              ...u,
              createdAt: u.createdAt.toISOString(),
            }))}
            audits={audits.map((audit) => ({
              ...audit,
              createdAt: audit.createdAt.toISOString(),
            }))}
          />
        </FadeIn>
      </Container>
    </main>
  );
}
