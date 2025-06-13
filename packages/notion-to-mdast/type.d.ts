import 'mdast';
import type { ListItem } from 'mdast';

declare module 'mdast' {
  interface ListItemGfm extends ListItem {
    checked?: boolean;
  }

  interface RootContentMap {
    listItem: ListItemGfm;
  }
}
