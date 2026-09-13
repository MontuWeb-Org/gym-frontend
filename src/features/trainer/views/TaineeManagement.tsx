"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTrainerTrainees } from "@/features/trainer/store/trainer.slice";
import { inviteTraineeThunk } from "@/features/auth/store/auth.slice"; 
import { TraineesTable } from "../components/TraineesTable";
import { InvitationModal } from "../components/InvitationModal";

export default function TraineeManagement() {
  const t = useTranslations("TraineeManagement");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { trainees = [], pagination, isLoading } = useAppSelector(
    (state) => state.trainer
  );

  useEffect(() => {
    dispatch(fetchTrainerTrainees({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleOpenTrainee = (id: number) => {
    router.push(`/trainer/trainees/${id}`);
  };

  const handleInviteTrainee = () => {
    setIsInviteModalOpen(true);
  };

  const handleSendInviteSubmit = async (email: string) => {
    const resultAction = await dispatch(inviteTraineeThunk(email));
    
    if (inviteTraineeThunk.fulfilled.match(resultAction)) {
      dispatch(fetchTrainerTrainees({ page: 1, limit: 10 }));
    } else {
      throw new Error(
        (resultAction.payload as string) || "Failed to send invitation"
      );
    }
  };

  const handleResendInvite = (id: number) => {
    const trainee = trainees.find((t) => t.id === id);
    if (trainee?.email) {
      dispatch(inviteTraineeThunk(trainee.email));
    }
  };

  return (
    <main className="container mx-auto p-6">
      <TraineesTable
        trainees={trainees}
        totalCount={pagination?.total ?? 0}
        isLoading={isLoading}
        onInvite={handleInviteTrainee}
        onOpenTrainee={handleOpenTrainee}
        onResendInvite={handleResendInvite}
      />

      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleSendInviteSubmit}
      />
    </main>
  );
}