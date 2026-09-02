"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice"; // adjust to match your auth slice import

export default function CoachSignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const handleCompleteSignup = () => {
    // Dispatch the actual user data captured from the form into Redux
   dispatch(
      setUser({
        id: "1",
        name: formData.fullName || "Coach User",
        email: formData.email || "coach@example.com",
        role: "coach",
      })
    );

    // Redirect to the coach dashboard
    router.push("/coach");
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 p-8 rounded-xl border border-border bg-card shadow-sm">
        
        {/* Header & Step Tracker */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Trainer Sign Up
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              {step === 1 && "Step 1 of 3 — Account details"}
              {step === 2 && "Step 2 of 3 — Select Billing Tier"}
              {step === 3 && "Step 3 of 3 — Payment Details"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Trainers self-register and select a billing tier before provisioning trainee seats.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`relative z-10 flex items-center justify-center size-8 rounded-full text-xs font-bold transition-colors ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 Form Content */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Karim Coach"
                required
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Business / Gym Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Apex Fitness Hub"
                required
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="karim@apexfit.com"
                required
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link href="/login">
                <Button variant="outline" type="button">
                  Back to Login
                </Button>
              </Link>
              <Button type="submit" className="gap-2">
                <span>Continue</span>
                <span>→</span>
                <span>Choose plan</span>
              </Button>
            </div>
          </form>
        )}

        {/* Step 2 Content */}
        {step === 2 && (
          <div className="space-y-4 py-8 text-center">
            <h3 className="text-lg font-medium">Billing Tier Selection</h3>
            <p className="text-sm text-muted-foreground">Select your trainee seat tier here.</p>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Continue to Payment</Button>
            </div>
          </div>
        )}

        {/* Step 3 Content */}
        {step === 3 && (
          <div className="space-y-4 py-8 text-center">
            <h3 className="text-lg font-medium">Payment Details</h3>
            <p className="text-sm text-muted-foreground">Enter your secure payment info.</p>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleCompleteSignup}>Complete Signup</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}