"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAdminTranslations } from "@/i18n";
import { useLocaleShort } from "@/i18n/useLocaleShort";
import { useAuthTokenMutation } from "@/integrations/hooks";

type FormValues = {
  email: string;
  password: string;
  remember?: boolean;
};

function safeNext(next: string | null | undefined, fallback: string): string {
  const v = String(next ?? "").trim();
  if (!v || !v.startsWith("/")) return fallback;
  if (v.startsWith("//")) return fallback;
  return v;
}

function getNestedString(value: unknown, path: string[]): string | null {
  let current: unknown = value;
  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) return null;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" && current.trim() ? current : null;
}

function getErrMessage(err: unknown, fallback: string): string {
  const candidates = [
    getNestedString(err, ["data", "error", "message"]),
    getNestedString(err, ["data", "error"]),
    getNestedString(err, ["data", "message"]),
    getNestedString(err, ["error"]),
  ];

  return candidates.find(Boolean) || fallback;
}

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const locale = useLocaleShort();
  const t = useAdminTranslations(locale);

  const [login, loginState] = useAuthTokenMutation();

  const FormSchema = z.object({
    email: z.string().email({ message: t("admin.auth.login.emailRequired") }),
    password: z.string().min(6, { message: t("admin.auth.login.passwordMinLength") }),
    remember: z.boolean().optional(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login({
        grant_type: "password",
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();

      toast.success(t("admin.auth.login.loginSuccess"));

      const next = safeNext(sp?.get("next"), "/admin");
      router.replace(next);
      router.refresh();
    } catch (err) {
      toast.error(getErrMessage(err, t("admin.auth.login.loginFailed")));
    }
  };

  const isBusy = loginState.isLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="font-bold text-[#0b1f3a]/72 text-xs uppercase tracking-wider">
                {t("admin.auth.login.emailLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("admin.auth.login.emailPlaceholder")}
                  autoComplete="email"
                  className="rounded-lg border-[#ffd24b]/70 bg-white/80 py-5 text-[#0b1f3a] transition-all focus:border-[#ff6a00] focus:ring-[#ff6a00]/20"
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="font-bold text-[#0b1f3a]/72 text-xs uppercase tracking-wider">
                {t("admin.auth.login.passwordLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("admin.auth.login.passwordPlaceholder")}
                  autoComplete="current-password"
                  className="rounded-lg border-[#ffd24b]/70 bg-white/80 py-5 text-[#0b1f3a] transition-all focus:border-[#ff6a00] focus:ring-[#ff6a00]/20"
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* UI-only remember */}
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl>
                <Checkbox
                  id="login-remember"
                  checked={!!field.value}
                  onCheckedChange={(v) => field.onChange(!!v)}
                  disabled={isBusy}
                  className="size-4"
                />
              </FormControl>
              <FormLabel htmlFor="login-remember" className="ml-1 font-medium text-[#555] text-sm">
                {t("admin.auth.login.rememberMe")}
              </FormLabel>
            </FormItem>
          )}
        />

        <Button
          className="w-full rounded-lg bg-[#ff6a00] py-6 font-black text-white shadow-[0_18px_42px_rgba(255,106,0,0.28)] transition-all duration-300 hover:bg-[#e85c00] hover:shadow-[0_22px_52px_rgba(255,106,0,0.34)]"
          type="submit"
          disabled={isBusy}
          aria-busy={isBusy}
        >
          {isBusy ? (
            <output className="flex items-center gap-2" aria-live="polite">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden
              />
              {t("admin.auth.login.loggingIn")}
            </output>
          ) : (
            t("admin.auth.login.loginButton")
          )}
        </Button>
      </form>
    </Form>
  );
}
