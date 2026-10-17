import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { apiVersion, dataset, projectId } from './sanity/env';
import { schemaTypes } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

export default defineConfig({
  name: 'kodeva',
  title: 'Kodeva CMS',
  basePath: '/studio',
  projectId: projectId || 'ganti-dengan-project-id',
  dataset,
  apiVersion,
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((template) => template.templateId !== 'landingPage');
      }
      return prev;
    },
  },
});
