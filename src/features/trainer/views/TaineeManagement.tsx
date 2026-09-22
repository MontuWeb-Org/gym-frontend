"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteTrainee, fetchTrainerTrainees } from "@/features/trainer/store/trainer.slice";
import { inviteTraineeThunk } from "@/features/auth/store/auth.slice"; 
import { TraineesTable } from "../components/TraineesTable";
import { InvitationModal } from "../components/InvitationModal";
import { toast } from "sonner";
import { ROUTES } from "@/data/routes";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function TraineeManagement() {
  const t = useTranslations("TraineesTable");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [deletingTraineeId, setDeletingTraineeId] = useState<number | null>(null);


  const { trainees = [], pagination, isLoading } = useAppSelector(
    (state) => state.trainer
  );

  useEffect(() => {
    dispatch(fetchTrainerTrainees({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleOpenTrainee = (id: number) => {
    router.push(ROUTES.TRAINER.TRAINEE_DETAILS(id));
  };

  const handleInviteTrainee = () => {
    setIsInviteModalOpen(true);
  };

  const handleSendInviteSubmit = async (email: string) => {
    const resultAction = await dispatch(inviteTraineeThunk(email));
    
    if (inviteTraineeThunk.fulfilled.match(resultAction)) {
      toast.success(t("toasts.inviteSuccess"));
      dispatch(fetchTrainerTrainees({ page: 1, limit: 10 }));
    } else {
      const errorMsg = (resultAction.payload as string) || t("toasts.inviteError");
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const handleResendInvite = (id: number) => {
    const trainee = trainees.find((t) => t.traineeId === id);
    if (trainee?.email) {
      try {
        dispatch(inviteTraineeThunk(trainee.email)).unwrap();
        toast.success(t("toasts.resendSuccess"));
      } catch (err) {
        toast.error(typeof err === "string" ? err : t("toasts.resendError"));
      }
    }
  };

const handleDeleteTrainee = async (traineeId: number) => {
  setDeletingTraineeId(traineeId);
  try {
    await dispatch(deleteTrainee(traineeId)).unwrap();
    toast.success(t("toasts.deleteSuccess"));
  } catch (err) {
    toast.error(typeof err === "string" ? err : t("toasts.deleteError"));
  } finally {
    setDeletingTraineeId(null);
  }
};

  return (
    <main className="container mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      
      <PageHeader
        title={t("title")}
        count={pagination?.total ?? trainees.length}
        actions={
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            size="default"
            className="font-heading text-sm uppercase tracking-wider shadow-md"
          >
            <UserPlus className="me-2 h-4 w-4" />
            {t("inviteTrainee")}
          </Button>
        }
      />
      
      <TraineesTable
        trainees={trainees}
        totalCount={pagination?.total ?? 0}
        isLoading={isLoading}
        onInvite={handleInviteTrainee}
        onOpenTrainee={handleOpenTrainee}
        onResendInvite={handleResendInvite}
        onDeleteTrainee={handleDeleteTrainee}
        deletingTraineeId={deletingTraineeId}
      />

      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleSendInviteSubmit}
      />
    </main>
  );
}