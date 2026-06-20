import { useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Icon, IconMoon, IconPencil, IconSun } from "@/components/icons";

import { CountrySelect } from "@/features/auth/components/CountrySelect";

import { PhoneMaskInput } from "@/features/auth/components/PhoneMaskInput";

import { DEFAULT_COUNTRY, type Country } from "@/features/auth/data/countries";

import { isPhoneComplete, toE164 } from "@/features/auth/lib/phone-mask";

import { useAuth, MAX_AUTH_ACCOUNTS } from "@/features/auth/auth-store";

import { useTheme } from "@/app/ThemeProvider";

import { cn } from "@/lib/utils";



type LoginStep = "phone" | "password";



function MetrogramLogo() {

  return (

    <div className="mx-auto mb-6 flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-full bg-[#00bbff] shadow-lg shadow-[#00bbff]/25">

      <svg

        viewBox="0 0 48 48"

        className="h-14 w-14 text-white"

        fill="currentColor"

        aria-hidden

      >

        <path d="M4 24 L44 8 L32 40 L24 26 L14 34 Z" />

      </svg>

    </div>

  );

}



function ThemeToggle() {

  const { theme, toggleTheme } = useTheme();



  return (

    <button

      type="button"

      onClick={toggleTheme}

      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow-sm backdrop-blur-sm transition hover:bg-white dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-900"

      aria-label={theme === "dark" ? "Light mode" : "Dark mode"}

    >

      <Icon
        icon={theme === "dark" ? IconSun : IconMoon}
        size={20}
      />

    </button>

  );

}



export function LoginPage() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const isAddAccount = searchParams.get("add") === "1";

  const { login, formatPhoneDisplay } = useAuth();

  const [step, setStep] = useState<LoginStep>("phone");

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);

  const [localDigits, setLocalDigits] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);



  const handleCountryChange = (next: Country) => {

    setCountry(next);

    setLocalDigits("");

    setError(null);

  };



  const handlePhoneNext = () => {

    if (!isPhoneComplete(country, localDigits)) {

      setError("Telefon raqamini to'liq kiriting");

      return;

    }

    const fullPhone = toE164(country, localDigits);

    setPhone(fullPhone);

    setError(null);

    setStep("password");

    setPassword("");

  };



  const handlePasswordLogin = async () => {

    if (password.length < 6) {

      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");

      return;

    }



    setLoading(true);

    setError(null);



    const ok = await login(phone, password, isAddAccount ? "add" : "default");

    setLoading(false);



    if (ok) {

      navigate("/", { replace: true });

    } else {

      setError(
        isAddAccount
          ? `Eng ko'pi bilan ${MAX_AUTH_ACCOUNTS} ta akkaunt qo'shish mumkin`
          : "Telefon raqam yoki parol noto'g'ri",
      );

      setPassword("");

    }

  };



  return (

    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-zinc-100 p-4 dark:bg-zinc-950">



      <ThemeToggle />



      <div

        className={cn(

          "relative z-10 w-full max-w-[26rem] rounded-2xl px-8 py-10 shadow-xl transition-colors duration-300",

          "bg-white dark:bg-[#212121]",

        )}

      >

        {step === "phone" ? (

          <>

            <MetrogramLogo />

            <h1 className="mb-2 text-center text-xl font-semibold text-zinc-900 dark:text-white">

              {isAddAccount ? "Yangi akkaunt qo'shish" : "Metrogram&apos;ga kirish"}

            </h1>

            <p className="mb-8 text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">

              {isAddAccount
                ? "Qo'shimcha profilingiz uchun telefon va parolni kiriting."
                : "Davlat kodini tasdiqlang va telefon raqamingizni kiriting."}

            </p>



            <div className="space-y-4">

              <CountrySelect

                value={country}

                onChange={handleCountryChange}

              />

              <PhoneMaskInput

                country={country}

                value={localDigits}

                onChange={(digits) => {

                  setLocalDigits(digits);

                  setError(null);

                }}

                onEnter={handlePhoneNext}

                autoFocus

              />

            </div>



            {error && (

              <p className="mt-4 text-center text-sm text-red-500">{error}</p>

            )}



            <Button

              size="lg"

              className="mt-8"

              onClick={handlePhoneNext}

            >

              Keyingi

            </Button>

          </>

        ) : (

          <>

            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center text-5xl">

              🐵

            </div>



            <div className="mb-2 flex items-center justify-center gap-2">

              <span className="text-lg font-semibold tracking-wide text-zinc-900 dark:text-white">

                {formatPhoneDisplay(phone)}

              </span>

              <button

                type="button"

                onClick={() => {

                  setStep("phone");
                  setPassword("");
                  setError(null);

                }}

                className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"

                aria-label="Telefon raqamni o'zgartirish"

              >

                <Icon icon={IconPencil} size={18} />

              </button>

            </div>



            <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Hisobingiz parolini kiriting.
            </p>



            <Input
              label="Parol"
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handlePasswordLogin();
              }}
              autoFocus
              disabled={loading}
            />



            {error && (
              <p className="mt-4 text-center text-sm text-red-500">{error}</p>
            )}



            <Button
              size="lg"
              className="mt-8"
              disabled={loading || password.length < 6}
              onClick={() => void handlePasswordLogin()}
            >
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>

          </>

        )}

      </div>

    </div>

  );

}


