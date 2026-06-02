import LlmPromptsClient from './_components/llm-prompts-client';
import { adminDocumentTitle } from '@/lib/admin-brand';

export const metadata = {
  title: adminDocumentTitle('LLM Promptları'),
};

export default function Page() {
  return <LlmPromptsClient />;
}
