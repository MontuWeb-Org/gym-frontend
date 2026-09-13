import { redirect } from "@/i18n/navigation";

interface TrainerPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { locale } = await params;

  redirect({ href: "/trainer/dashboard", locale });
}