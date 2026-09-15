import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@/data/routes";

interface TrainerPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { locale } = await params;
  redirect({ href: ROUTES.TRAINER.DASHBOARD, locale });
}