import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Setări</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Limba aplicației</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option>Română</option>
            <option>Engleză</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temă</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option>Light</option>
            <option>Dark</option>
          </select>
        </div>
        <Button className="mt-4">Salvează</Button>
      </div>
    </div>
  );
}
