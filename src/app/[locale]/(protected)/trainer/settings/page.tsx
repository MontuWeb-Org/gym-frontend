import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@/data/routes";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  redirect({ href: ROUTES.TRAINER.SETTINGS.PROFILE, locale });
}