import type { Root } from 'mdast';
import { ListBlockChildrenResponse } from '../../utils/notion';

import { transformToMdast } from './src/transform';

export default function NotionParser(data: {}): Root {
  const safeData = ListBlockChildrenResponse.safeParse(data);
  if (!safeData.success) {
    throw new Error(`Invalid data: ${safeData.error.message}`);
  }

  const { results } = safeData.data;

  const root = transformToMdast(results);

  return root;
}
