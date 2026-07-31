import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { ExportPdfClient } from "./ExportPdfClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Resume | Portfolio.OS",
  description: "Export your portfolio to an ATS-friendly PDF resume",
};

export default async function PdfExportPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user portfolio
  const portfolioResult = await pool.query(
    'SELECT content FROM "Portfolio" WHERE "userId" = $1 LIMIT 1',
    [session.user.id]
  );

  if (portfolioResult.rows.length === 0) {
    redirect("/dashboard/edit");
  }

  const content = portfolioResult.rows[0].content || {};
  const sections = content.sections || [];

  return <ExportPdfClient sections={sections} />;
}
