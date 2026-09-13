import { redirect } from "@/i18n/navigation";

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  redirect({ href: "/admin/dashboard", locale });
}