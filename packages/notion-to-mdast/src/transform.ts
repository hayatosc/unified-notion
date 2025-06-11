import type { BlockContent, DefinitionContent, PhrasingContent, Root } from 'mdast';
import type { Block, BulletedListItemBlock, NumberedListItemBlock, RichText } from '../../../utils/notion';

export const transformToMdast = (data: Block[]): Root => {
  const root: Root = {
    type: 'root',
    children: [],
  };

  let i = 0;
  while (i < data.length) {
    const block = data[i];

    switch (block.type) {
      case 'paragraph':
        root.children.push({
          type: 'paragraph',
          children: richTextTransform(block.paragraph.rich_text),
        });
        break;

      case 'heading_1':
        root.children.push({
          type: 'heading',
          depth: 1,
          children: richTextTransform(block.heading_1.rich_text),
        });
        break;

      case 'heading_2':
        root.children.push({
          type: 'heading',
          depth: 2,
          children: richTextTransform(block.heading_2.rich_text),
        });
        break;

      case 'heading_3':
        root.children.push({
          type: 'heading',
          depth: 3,
          children: richTextTransform(block.heading_3.rich_text),
        });
        break;

      case 'bulleted_list_item':
      case 'numbered_list_item':
        // 連続するリスト項目をグループ化
        const listItems: (BulletedListItemBlock | NumberedListItemBlock)[] = [];
        const isOrdered = block.type === 'numbered_list_item';

        while (
          i < data.length &&
          (data[i].type === 'bulleted_list_item' || data[i].type === 'numbered_list_item') &&
          (data[i].type === 'numbered_list_item') === isOrdered
        ) {
          listItems.push(data[i] as BulletedListItemBlock | NumberedListItemBlock);
          i++;
        }
        i--; // whileループで余分に進んだ分を戻す

        const transformedList = ListTransform(listItems, isOrdered);
        root.children.push(...transformedList);
        break;

      case 'quote':
        root.children.push({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: richTextTransform(block.quote.rich_text),
            },
          ],
        });
        break;
      case 'code':
        root.children.push({
          type: 'code',
          lang: block.code.language || undefined,
          value: block.code.rich_text.map((text) => text.plain_text).join(''),
        });
        break;
      case 'image':
        root.children.push({
          type: 'image',
          url: block.image.file?.url || block.image.external?.url || '',
          alt: block.image.caption.map((caption) => caption.plain_text).join(''),
        });
        break;
    }

    i++;
  }

  return root;
};

export const richTextTransform = (richText: RichText[]): PhrasingContent[] => {
  return richText.map((text) => {
    if (text.type === 'text') {
      if (text.annotations.code) {
        return {
          type: 'inlineCode',
          value: text.text.content,
        };
      } else if (text.annotations.bold) {
        return {
          type: 'strong',
          children: [{ type: 'text', value: text.text.content }],
        };
      } else if (text.annotations.italic) {
        return {
          type: 'emphasis',
          children: [{ type: 'text', value: text.text.content }],
        };
      } else if (text.annotations.strikethrough) {
        return {
          type: 'delete',
          children: [{ type: 'text', value: text.text.content }],
        };
      }
    }
    return {
      type: 'text',
      value: text.plain_text,
    };
  });
};

export const ListTransform = (
  list: (BulletedListItemBlock | NumberedListItemBlock)[],
  ordered: boolean = false
): (BlockContent | DefinitionContent)[] => {
  const result: (BlockContent | DefinitionContent)[] = [];

  // リストアイテムをグループ化
  const listItems = list.map((listItem) => {
    const item = listItem.type === 'bulleted_list_item' ? listItem.bulleted_list_item : listItem.numbered_list_item;

    const listItemContent: any = {
      type: 'listItem',
      children: [
        {
          type: 'paragraph',
          children: richTextTransform(item.rich_text),
        },
      ],
    };

    // 子要素がある場合は再帰的に処理
    if (item.children && item.children.length > 0) {
      const childListItems = item.children.filter(
        (child): child is BulletedListItemBlock | NumberedListItemBlock => child.type === 'bulleted_list_item' || child.type === 'numbered_list_item'
      );

      if (childListItems.length > 0) {
        const childOrdered = childListItems[0].type === 'numbered_list_item';
        const childList = ListTransform(childListItems, childOrdered);
        listItemContent.children.push(...childList);
      }

      // リスト以外の子要素も処理
      const otherChildren = item.children.filter((child) => child.type !== 'bulleted_list_item' && child.type !== 'numbered_list_item');

      for (const child of otherChildren) {
        if (child.type === 'paragraph') {
          listItemContent.children.push({
            type: 'paragraph',
            children: richTextTransform(child.paragraph.rich_text),
          });
        }
      }
    }

    return listItemContent;
  });

  // リストノードを作成
  if (listItems.length > 0) {
    result.push({
      type: 'list',
      ordered,
      children: listItems,
    });
  }

  return result;
};
