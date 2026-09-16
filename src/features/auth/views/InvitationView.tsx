"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AcceptInvitation from "../components/AcceptInvitation";
import { inviteVerifyThunk, inviteAcceptThunk } from "../store/auth.slice";

export default function InvitationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = searchParams.get("token") || "";

  const { isLoading, error: globalError, creationToken, inviteDetails } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token) {
      dispatch(inviteVerifyThunk(token));
    }
  }, [dispatch, token]);

  const handleAccept = async () => {
    if (!creationToken || !inviteDetails) return;

    if (inviteDetails.status === "ACCEPT_INVITATION") {
      const result = await dispatch(
        inviteAcceptThunk({
          creationToken,
          accept: true,
        })
      );

      if (inviteAcceptThunk.fulfilled.match(result)) {
        router.push("/trainee");
      }
    } else if (inviteDetails.status === "SETUP_PASSWORD") {
      router.push("/signup/trainee");
    }
  };

  const handleReject = async () => {
    if (creationToken) {
      await dispatch(
        inviteAcceptThunk({
          creationToken,
          accept: false,
        })
      );
    }
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <AcceptInvitation
        trainerName={inviteDetails?.trainerName}
        isLoading={isLoading}
        globalError={globalError}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
}