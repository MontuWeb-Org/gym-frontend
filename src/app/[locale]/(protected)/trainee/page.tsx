import { redirect } from "@/i18n/navigation";

interface TraineePageProps {
  params: Promise<{ locale: string }>;
}

export default async function TraineePage({ params }: TraineePageProps) {
  const { locale } = await params;
  redirect({ href: "/trainee/dashboard", locale });
}