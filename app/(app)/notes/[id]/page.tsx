import { NoteEditor } from '@/components/screens/NoteEditor';

export default async function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <NoteEditor id={id} />;
}
