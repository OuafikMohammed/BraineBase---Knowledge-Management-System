"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendPasswordResetCode, verifyResetCode, resetPassword } from "@/lib/auth";

export default function ResetPasswordModal() {
  const [step, setStep] = useState("email"); // email -> code -> newPassword
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await sendPasswordResetCode(email);
      setStep("code");
    } catch (error) {
      setErrors(error.errors || { email: ["Failed to send reset code"] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await verifyResetCode(email, code);
      setStep("newPassword");
    } catch (error) {
      setErrors(error.errors || { code: ["Invalid code"] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (newPassword !== confirmPassword) {
      setErrors({ password: ["Passwords do not match"] });
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(email, code, newPassword, confirmPassword);
      setShowSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        // Reset all states
        setStep("email");
        setEmail("");
        setCode("");
        setNewPassword("");
        setConfirmPassword("");
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      setErrors(error.errors || { password: ["Failed to reset password"] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-[#7b4fff] hover:text-[#9370ff] transition-colors">
          Reset Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1333]/95 backdrop-blur-lg border-[#7b4fff]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Reset Password</DialogTitle>
          <DialogDescription className="text-[#a0a0c0]">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "code" && "Enter the 6-digit code sent to your email"}
            {step === "newPassword" && "Create your new password"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center p-4"
            >
              <div className="rounded-full bg-green-500/20 p-3 mb-4">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-white text-lg font-semibold">Password reset successful!</p>
              <p className="text-[#a0a0c0] text-sm mt-2">You can now login with your new password.</p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, x: step === "email" ? -20 : step === "code" ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step === "email" ? 20 : step === "code" ? 0 : -20 }}
              onSubmit={
                step === "email"
                  ? handleSubmitEmail
                  : step === "code"
                  ? handleSubmitCode
                  : handleSubmitNewPassword
              }
              className="space-y-4 mt-4"
            >
              {step === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#a0a0c0]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
                </div>
              )}

              {step === "code" && (
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-[#a0a0c0]">
                    Reset Code
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white tracking-widest text-center ${
                      errors.code ? "border-red-500" : ""
                    }`}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  />
                  {errors.code && <p className="text-red-500 text-sm">{errors.code[0]}</p>}
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-sm text-[#7b4fff] hover:text-[#9370ff] transition-colors mt-2"
                  >
                    Change email
                  </button>
                </div>
              )}

              {step === "newPassword" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[#a0a0c0]">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[#a0a0c0]">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm">{errors.password[0]}</p>}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] text-white"
              >
                {isLoading
                  ? "Processing..."
                  : step === "email"
                  ? "Send Reset Code"
                  : step === "code"
                  ? "Verify Code"
                  : "Reset Password"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
