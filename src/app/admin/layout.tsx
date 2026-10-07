// src/app/admin/layout.tsx

import { AdminTabs } from "@/components/admin/admin-tabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-10">
      <AdminTabs />
      {children}
    </div>
  );
}