import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FaGoogle, FaFacebookF, FaApple, FaYahoo } from "react-icons/fa";

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Autentificare:", { email, password });

    // Simulăm succesul autentificării
    if (onSuccess) onSuccess();
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Autentificare cu ${provider}`);
    // Aici poți integra Firebase Auth, OAuth etc.
    if (onSuccess) onSuccess();
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center">Autentifică-te</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="ex: nume@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Parolă</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full mt-4 text-base">
          Autentifică-te
        </Button>
      </form>

      <div className="text-center space-y-2 text-sm text-gray-600">
        <p>
          Nu ai cont?{" "}
          <button
            type="button"
            className={cn("text-blue-600 hover:underline")}
            onClick={() => alert("Deschide formularul de înregistrare")}
          >
            Creează cont
          </button>
        </p>
        <p>
          Ai uitat parola?{" "}
          <button
            type="button"
            className={cn("text-blue-600 hover:underline")}
            onClick={() => alert("Deschide resetare parolă")}
          >
            Reseteaz-o aici
          </button>
        </p>
      </div>

      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-sm text-gray-500">sau continuă cu</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialLogin("Google")}
        >
          <FaGoogle className="text-red-500" />
          Continuă cu Google
        </Button>

        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialLogin("Facebook")}
        >
          <FaFacebookF className="text-blue-600" />
          Continuă cu Facebook
        </Button>

        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialLogin("Yahoo")}
        >
          <FaYahoo className="text-purple-600" />
          Continuă cu Yahoo
        </Button>

        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialLogin("Apple")}
        >
          <FaApple className="text-black" />
          Continuă cu Apple
        </Button>
      </div>
    </div>
  );
}
