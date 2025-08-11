import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { AuthForm } from "./AuthForm";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-screen max-w-md">
        <SheetHeader>
          <SheetTitle>Autentificare</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <AuthForm onSuccess={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
