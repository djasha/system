import { Tabs } from './Tabs';
import { PreviewIsland } from './PreviewIsland';
import { PromptPanel } from './PromptPanel';
import { BundlePanel } from './BundlePanel';

interface Props {
  slug: string;
  sourceHtml: string;
  promptBody: string;
  bundle: string;
}

export function ComponentTabs({ slug, sourceHtml, promptBody, bundle }: Props) {
  const tabs = [
    {
      id: 'preview',
      label: 'Preview',
      content: <PreviewIsland slug={slug} />,
    },
    {
      id: 'code',
      label: 'Code',
      content: (
        <div
          className="font-mono text-sm overflow-auto"
          dangerouslySetInnerHTML={{ __html: sourceHtml }}
        />
      ),
    },
    {
      id: 'prompt',
      label: 'Prompt',
      content: <PromptPanel promptBody={promptBody} />,
    },
    {
      id: 'bundle',
      label: 'Bundle',
      content: <BundlePanel bundle={bundle} slug={slug} />,
    },
  ];

  return <Tabs tabs={tabs} />;
}
