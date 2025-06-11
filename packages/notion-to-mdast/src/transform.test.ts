import { describe, expect, it } from 'vitest';
import type { BulletedListItemBlock, NumberedListItemBlock, RichText, ToDoBlock } from '../../../utils/notion';
import { ListTransform, richTextTransform } from './transform';

const createBulletedListItem = (text: string, children?: (BulletedListItemBlock | NumberedListItemBlock | ToDoBlock)[]): BulletedListItemBlock => ({
  object: 'block',
  id: 'test-id',
  parent: { type: 'page_id', page_id: 'test-page-id' },
  created_time: '2023-01-01T00:00:00.000Z',
  created_by: { object: 'user', id: 'test-user-id' },
  last_edited_time: '2023-01-01T00:00:00.000Z',
  last_edited_by: { object: 'user', id: 'test-user-id' },
  has_children: !!children && children.length > 0,
  archived: false,
  type: 'bulleted_list_item',
  bulleted_list_item: {
    rich_text: [
      {
        type: 'text',
        text: { content: text, link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default',
        },
        plain_text: text,
        href: null,
      },
    ],
    color: 'default',
    children,
  },
});

const createNumberedListItem = (text: string, children?: (BulletedListItemBlock | NumberedListItemBlock | ToDoBlock)[]): NumberedListItemBlock => ({
  object: 'block',
  id: 'test-id',
  parent: { type: 'page_id', page_id: 'test-page-id' },
  created_time: '2023-01-01T00:00:00.000Z',
  created_by: { object: 'user', id: 'test-user-id' },
  last_edited_time: '2023-01-01T00:00:00.000Z',
  last_edited_by: { object: 'user', id: 'test-user-id' },
  has_children: !!children && children.length > 0,
  archived: false,
  type: 'numbered_list_item',
  numbered_list_item: {
    rich_text: [
      {
        type: 'text',
        text: { content: text, link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default',
        },
        plain_text: text,
        href: null,
      },
    ],
    color: 'default',
    children,
  },
});

const createToDoItem = (
  text: string,
  checked: boolean = false,
  children?: (BulletedListItemBlock | NumberedListItemBlock | ToDoBlock)[]
): ToDoBlock => ({
  object: 'block',
  id: 'test-id',
  parent: { type: 'page_id', page_id: 'test-page-id' },
  created_time: '2023-01-01T00:00:00.000Z',
  created_by: { object: 'user', id: 'test-user-id' },
  last_edited_time: '2023-01-01T00:00:00.000Z',
  last_edited_by: { object: 'user', id: 'test-user-id' },
  has_children: !!children && children.length > 0,
  archived: false,
  type: 'to_do',
  to_do: {
    rich_text: [
      {
        type: 'text',
        text: { content: text, link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default',
        },
        plain_text: text,
        href: null,
      },
    ],
    checked,
    color: 'default',
    children,
  },
});

// テスト用のRichTextモックデータを作成するヘルパー関数
const createRichText = (
  content: string,
  annotations: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: 'default' | 'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red';
  } = {}
): RichText => ({
  type: 'text',
  text: { content, link: null },
  annotations: {
    bold: annotations.bold || false,
    italic: annotations.italic || false,
    strikethrough: annotations.strikethrough || false,
    underline: annotations.underline || false,
    code: annotations.code || false,
    color: annotations.color || 'default',
  },
  plain_text: content,
  href: null,
});

describe('ListTransform', () => {
  it('should transform simple bulleted list items', () => {
    const listItems = [createBulletedListItem('First item'), createBulletedListItem('Second item'), createBulletedListItem('Third item')];

    const result = ListTransform(listItems, false, false);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'list',
      ordered: false,
      children: [
        {
          type: 'listItem',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'First item' }],
            },
          ],
        },
        {
          type: 'listItem',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Second item' }],
            },
          ],
        },
        {
          type: 'listItem',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Third item' }],
            },
          ],
        },
      ],
    });
  });

  it('should transform simple numbered list items', () => {
    const listItems = [createNumberedListItem('First numbered item'), createNumberedListItem('Second numbered item')];

    const result = ListTransform(listItems, true, false);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'list',
      ordered: true,
      children: [
        {
          type: 'listItem',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'First numbered item' }],
            },
          ],
        },
        {
          type: 'listItem',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Second numbered item' }],
            },
          ],
        },
      ],
    });
  });

  it('should transform to-do items as task lists', () => {
    const todoItems = [
      createToDoItem('Unchecked task', false),
      createToDoItem('Checked task', true),
      createToDoItem('Another unchecked task', false),
    ];

    const result = ListTransform(todoItems, false, true);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'list',
      ordered: false,
      children: [
        {
          type: 'listItem',
          checked: false,
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Unchecked task' }],
            },
          ],
        },
        {
          type: 'listItem',
          checked: true,
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Checked task' }],
            },
          ],
        },
        {
          type: 'listItem',
          checked: false,
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Another unchecked task' }],
            },
          ],
        },
      ],
    });
  });

  it('should handle nested to-do items', () => {
    const nestedTodoItems = [createToDoItem('Nested task 1', false), createToDoItem('Nested task 2', true)];

    const todoItems = [createToDoItem('Parent task', false, nestedTodoItems), createToDoItem('Another parent task', true)];

    const result = ListTransform(todoItems, false, true);

    expect(result).toHaveLength(1);
    const listNode = result[0] as any;
    expect(listNode.type).toBe('list');
    expect(listNode.ordered).toBe(false);
    expect(listNode.children).toHaveLength(2);

    // First item should have nested tasks
    expect(listNode.children[0].checked).toBe(false);
    expect(listNode.children[0].children).toHaveLength(2); // paragraph + nested list

    const nestedList = listNode.children[0].children[1];
    expect(nestedList.type).toBe('list');
    expect(nestedList.ordered).toBe(false);
    expect(nestedList.children).toHaveLength(2);
    expect(nestedList.children[0].checked).toBe(false);
    expect(nestedList.children[1].checked).toBe(true);

    // Second item should be a simple checked task
    expect(listNode.children[1].checked).toBe(true);
    expect(listNode.children[1].children).toHaveLength(1); // only paragraph
  });

  it('should handle nested list items', () => {
    const nestedItems = [createBulletedListItem('Nested item 1'), createBulletedListItem('Nested item 2')];

    const listItems = [createBulletedListItem('Parent item 1', nestedItems), createBulletedListItem('Parent item 2')];

    const result = ListTransform(listItems, false, false);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'list',
      ordered: false,
      children: [
        {
          type: 'listItem',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Parent item 1' }],
            },
            {
              type: 'list',
              ordered: false,
              children: [
                {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ type: 'text', value: 'Nested item 1' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ type: 'text', value: 'Nested item 2' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Parent item 2' }],
            },
          ],
        },
      ],
    });
  });

  it('should handle mixed nested list types', () => {
    const nestedNumberedItems = [createNumberedListItem('Nested numbered 1'), createNumberedListItem('Nested numbered 2')];

    const listItems = [createBulletedListItem('Bulleted parent', nestedNumberedItems)];

    const result = ListTransform(listItems, false, false);

    expect(result).toHaveLength(1);
    const listNode = result[0] as any;
    expect(listNode.type).toBe('list');
    expect(listNode.ordered).toBe(false);
    expect(listNode.children[0].children).toHaveLength(2); // 段落 + ネストされたリスト

    const nestedList = listNode.children[0].children[1];
    expect(nestedList.type).toBe('list');
    expect(nestedList.ordered).toBe(true); // 番号付きリスト
  });

  it('should handle empty list', () => {
    const result = ListTransform([], false, false);
    expect(result).toHaveLength(0);
  });

  it('should handle deeply nested lists', () => {
    const deeplyNestedItems = [createBulletedListItem('Deep level 2')];

    const firstLevelNested = [createBulletedListItem('Level 1 nested', deeplyNestedItems)];

    const listItems = [createBulletedListItem('Root level', firstLevelNested)];

    const result = ListTransform(listItems, false, false);

    expect(result).toHaveLength(1);
    const listNode = result[0] as any;
    expect(listNode.children[0].children).toHaveLength(2); // 段落 + ネストされたリスト

    const nestedList = listNode.children[0].children[1];
    expect(nestedList.children[0].children).toHaveLength(2); // さらにネストされた構造
  });
});

describe('richTextTransform', () => {
  it('should transform plain text', () => {
    const richText = [createRichText('Hello world')];
    const result = richTextTransform(richText);

    expect(result).toEqual([
      {
        type: 'text',
        value: 'Hello world',
      },
    ]);
  });

  it('should transform bold text', () => {
    const richText = [createRichText('Bold text', { bold: true })];
    const result = richTextTransform(richText);

    expect(result).toEqual([
      {
        type: 'strong',
        children: [{ type: 'text', value: 'Bold text' }],
      },
    ]);
  });

  it('should transform italic text', () => {
    const richText = [createRichText('Italic text', { italic: true })];
    const result = richTextTransform(richText);

    expect(result).toEqual([
      {
        type: 'emphasis',
        children: [{ type: 'text', value: 'Italic text' }],
      },
    ]);
  });

  it('should transform strikethrough text', () => {
    const richText = [createRichText('Strikethrough text', { strikethrough: true })];
    const result = richTextTransform(richText);

    expect(result).toEqual([
      {
        type: 'delete',
        children: [{ type: 'text', value: 'Strikethrough text' }],
      },
    ]);
  });

  it('should transform code text', () => {
    const richText = [createRichText('const hello = "world"', { code: true })];
    const result = richTextTransform(richText);

    expect(result).toEqual([
      {
        type: 'inlineCode',
        value: 'const hello = "world"',
      },
    ]);
  });

  it('should handle mixed formatting in multiple rich text elements', () => {
    const richText = [
      createRichText('Plain text '),
      createRichText('bold', { bold: true }),
      createRichText(' and '),
      createRichText('italic', { italic: true }),
      createRichText(' text'),
    ];
    const result = richTextTransform(richText);

    expect(result).toEqual([
      { type: 'text', value: 'Plain text ' },
      {
        type: 'strong',
        children: [{ type: 'text', value: 'bold' }],
      },
      { type: 'text', value: ' and ' },
      {
        type: 'emphasis',
        children: [{ type: 'text', value: 'italic' }],
      },
      { type: 'text', value: ' text' },
    ]);
  });

  it('should handle empty rich text array', () => {
    const richText: RichText[] = [];
    const result = richTextTransform(richText);

    expect(result).toEqual([]);
  });

  it('should handle non-text type rich text elements', () => {
    const richText: RichText[] = [
      {
        type: 'mention',
        plain_text: 'Mention text',
      } as RichText,
    ];
    const result = richTextTransform(richText);

    expect(result).toEqual([
      {
        type: 'text',
        value: 'Mention text',
      },
    ]);
  });
});
