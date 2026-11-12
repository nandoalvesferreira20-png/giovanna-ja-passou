import { notFound } from "next/navigation";
import { modules } from "@/content";
import { Lesson } from "@/components/study-app";
export function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }));
}
export const dynamicParams = false;
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!modules.some((m) => m.slug === slug)) notFound();
  return <Lesson slug={slug} />;
}
