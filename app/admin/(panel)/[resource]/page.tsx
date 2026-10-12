import { notFound } from 'next/navigation';
import { getResource } from '@/lib/resources';
import ResourceManager from '@/components/admin/ResourceManager';

export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!getResource(resource)) notFound();
  return <ResourceManager key={resource} resource={resource} />;
}
