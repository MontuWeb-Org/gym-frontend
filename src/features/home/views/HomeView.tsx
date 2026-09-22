// src/views/HomeView.tsx
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/user/store/user.slice";
import { ROUTES, getDashboardRoute } from "@/data/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowRight, Activity, Users, Flame } from "lucide-react";

export function HomeView() {
  const t = useTranslations("Home");
  const loginT = useTranslations("Login");
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-40 -left-4 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-40 size-96 rounded-full bg-primary/10 blur-3xl" />

      <main className="container mx-auto px-4 py-12 md:px-6 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          <div className="flex flex-col items-start space-y-6 text-start lg:col-span-7">
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 text-md uppercase tracking-widest border-primary/40 text-primary">
              <Dumbbell className="size-5" />
              <span>{t("badge")}</span>
            </Badge>

            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-black uppercase text-foreground leading-[0.9]">
              {t("title")}
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl font-normal leading-relaxed">
              {t("description")}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              {user ? (
                <div className="flex flex-col items-start gap-3 w-full sm:w-auto">
                  <p className="text-sm font-semibold text-primary">
                    {t("welcomeBack", { name: user.name })}
                  </p>
                  <Button asChild size="lg" className="font-heading text-lg uppercase tracking-wider h-14 px-8 shadow-lg hover:shadow-primary/25 w-full sm:w-auto">
                    <Link href={getDashboardRoute(user.role)}>
                      {t("exploreAccount")}
                      <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <Button asChild size="lg" className="font-heading text-lg uppercase tracking-wider h-14 px-8 shadow-lg hover:shadow-primary/25">
                    <Link href={ROUTES.LOGIN}>
                      {loginT("submitButton")}
                      <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-heading text-lg uppercase tracking-wider h-14 px-8">
                    <Link href={ROUTES.SIGNUP.TRAINER}>
                      {t("joinAsTrainer")}
                    </Link>
                  </Button>
                </>
              )}
            </div>

          </div>

          {/* Right Column: Dynamic Fitness Preview Grid */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl border border-border/80 bg-card/50 p-6 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl uppercase tracking-wider text-foreground">{t("widget.title")}</h3>
                    <p className="text-xs text-muted-foreground">{t("widget.subtitle")}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">
                  {t("widget.statusActive")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/60 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("widget.todaysWorkout")}</p>
                    <p className="text-xs text-muted-foreground">{t("widget.workoutDesc")}</p>
                  </div>
                </div>
                <span className="font-heading text-sm text-foreground">{t("widget.workoutTime")}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/60 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("widget.personalTrainer")}</p>
                    <p className="text-xs text-muted-foreground">{t("widget.trainerDesc")}</p>
                  </div>
                </div>
                <span className="font-heading text-sm text-emerald-500">{t("widget.statusConnected")}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}