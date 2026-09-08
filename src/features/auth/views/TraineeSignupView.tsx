// "use client";

// import { useState } from "react";
// import { useRouter } from "@/i18n/navigation";
// import { useAppDispatch } from "@/store/hooks";
// import { setUser } from "@/features/auth/store/auth.slice";
// import AuthForm from "@/features/auth/components/AuthForm";
// import { UserRole } from "@/types/user.types";

// export default function TraineeSignupView() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

//   const handlePasswordChange = (value: string) => {
//     setPassword(value);
//     if (value.length > 0 && !passwordRegex.test(value)) {
//       setError(
//         "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character."
//       );
//     } else {
//       setError(null);
//     }
//   };

//   const handleActivate = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!passwordRegex.test(password)) {
//       setError(
//         "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character."
//       );
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     setError(null);
//     setIsLoading(true);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 800));

//       const traineeUser = {
//         id: "usr_trainee_" + Date.now(),
//         name: "Assigned Trainee",
//         email: "trainee@gym.com",
//         role: UserRole.TRAINEE,
//       };

//       dispatch(setUser(traineeUser));
//       router.push("/trainee");
//     } catch {
//       setError("Account activation failed. Link may be expired.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <main>
//       <AuthForm
//         title="Activate Your Account"
//         subtitle="Coach Karim invited you to Gym Platform"
//         submitLabel="Activate My Account"
//         onSubmit={handleActivate}
//         isLoading={isLoading}
//         error={error}
//         values={{ password, confirmPassword }}
//         onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//           const { name, value } = e.target;
//           if (name === "password") {
//             handlePasswordChange(value);
//           }
//           if (name === "confirmPassword") {
//             setConfirmPassword(value);
//             if (error === "Passwords do not match" && value === password) {
//               setError(null);
//             }
//           }
//         }}
//         fields={[
//           {
//             name: "password",
//             label: "Create Password",
//             type: "password",
//             placeholder: "••••••••",
//             required: true,
//           },
//           {
//             name: "confirmPassword",
//             label: "Confirm Password",
//             type: "password",
//             placeholder: "••••••••",
//             required: true,
//           },
//         ]}
//       />
//     </main>
//   );
// }

export default function TraineeSignupView() { }