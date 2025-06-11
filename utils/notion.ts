import { z } from 'zod';

// 基本的な共通型
const UUID = z.string().uuid();
const ISO8601DateTime = z.string().datetime();

// 色の定義
const ApiColor = z.enum([
  'default',
  'gray',
  'brown',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'red',
  'gray_background',
  'brown_background',
  'orange_background',
  'yellow_background',
  'green_background',
  'blue_background',
  'purple_background',
  'pink_background',
  'red_background',
]);
type ApiColor = z.infer<typeof ApiColor>;

// ユーザーオブジェクト
const PartialUser = z.object({
  object: z.literal('user'),
  id: UUID,
});
type PartialUser = z.infer<typeof PartialUser>;

// 注釈（テキストスタイル）
const Annotations = z.object({
  bold: z.boolean(),
  italic: z.boolean(),
  strikethrough: z.boolean(),
  underline: z.boolean(),
  code: z.boolean(),
  color: ApiColor,
});
type Annotations = z.infer<typeof Annotations>;

// リッチテキストオブジェクト
const TextRichText = z.object({
  type: z.literal('text'),
  text: z.object({
    content: z.string(),
    link: z
      .object({
        url: z.string().url(),
      })
      .nullable(),
  }),
  annotations: Annotations,
  plain_text: z.string(),
  href: z.string().url().nullable(),
});

const EquationRichText = z.object({
  type: z.literal('equation'),
  equation: z.object({
    expression: z.string(),
  }),
  annotations: Annotations,
  plain_text: z.string(),
  href: z.string().url().nullable(),
});

const MentionRichText = z.object({
  type: z.literal('mention'),
  mention: z.union([
    z.object({
      type: z.literal('user'),
      user: PartialUser,
    }),
    z.object({
      type: z.literal('date'),
      date: z.object({
        start: z.string(),
        end: z.string().nullable(),
        time_zone: z.string().nullable(),
      }),
    }),
    z.object({
      type: z.literal('page'),
      page: z.object({
        id: UUID,
      }),
    }),
    z.object({
      type: z.literal('database'),
      database: z.object({
        id: UUID,
      }),
    }),
    z.object({
      type: z.literal('link_preview'),
      link_preview: z.object({
        url: z.string().url(),
      }),
    }),
  ]),
  annotations: Annotations,
  plain_text: z.string(),
  href: z.string().url().nullable(),
});

const RichText = z.union([TextRichText, EquationRichText, MentionRichText]);
export type RichText = z.infer<typeof RichText>;

// 親オブジェクト
const Parent = z.union([
  z.object({
    type: z.literal('database_id'),
    database_id: UUID,
  }),
  z.object({
    type: z.literal('page_id'),
    page_id: UUID,
  }),
  z.object({
    type: z.literal('block_id'),
    block_id: UUID,
  }),
  z.object({
    type: z.literal('workspace'),
    workspace: z.literal(true),
  }),
]);
type Parent = z.infer<typeof Parent>;

// 基本ブロック構造
const BaseBlock = z.object({
  object: z.literal('block'),
  id: UUID,
  parent: Parent,
  created_time: ISO8601DateTime,
  created_by: PartialUser,
  last_edited_time: ISO8601DateTime,
  last_edited_by: PartialUser,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean().optional(),
});
type BaseBlock = z.infer<typeof BaseBlock>;

// --- TypeScript Interface Definitions ---

const Icon = z
  .union([
    z.object({
      emoji: z.string(),
    }),
    z.object({
      type: z.literal('external'),
      external: z.object({
        url: z.string().url(),
      }),
    }),
  ])
  .nullable();
type Icon = z.infer<typeof Icon>;

const FileObject = z.object({
  type: z.enum(['external', 'file']),
  external: z
    .object({
      url: z.string().url(),
    })
    .optional(),
  file: z
    .object({
      url: z.string().url(),
      expiry_time: ISO8601DateTime,
    })
    .optional(),
});
type FileObject = z.infer<typeof FileObject>;

export type Block =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | ToDoBlock
  | ToggleBlock
  | QuoteBlock
  | CalloutBlock
  | CodeBlock
  | DividerBlock
  | BreadcrumbBlock
  | TableOfContentsBlock
  | ImageBlock
  | BookmarkBlock
  | EmbedBlock
  | FileBlock
  | ChildPageBlock
  | ChildDatabaseBlock
  | TableBlock
  | TableRowBlock
  | EquationBlock
  | UnsupportedBlock;

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  paragraph: {
    rich_text: RichText[];
    color: ApiColor;
    children?: Block[];
  };
}

export interface Heading1Block extends BaseBlock {
  type: 'heading_1';
  heading_1: {
    rich_text: RichText[];
    color: ApiColor;
    is_toggleable: boolean;
  };
}

export interface Heading2Block extends BaseBlock {
  type: 'heading_2';
  heading_2: {
    rich_text: RichText[];
    color: ApiColor;
    is_toggleable: boolean;
  };
}

export interface Heading3Block extends BaseBlock {
  type: 'heading_3';
  heading_3: {
    rich_text: RichText[];
    color: ApiColor;
    is_toggleable: boolean;
  };
}

export interface BulletedListItemBlock extends BaseBlock {
  type: 'bulleted_list_item';
  bulleted_list_item: {
    rich_text: RichText[];
    color: ApiColor;
    children?: Block[];
  };
}

export interface NumberedListItemBlock extends BaseBlock {
  type: 'numbered_list_item';
  numbered_list_item: {
    rich_text: RichText[];
    color: ApiColor;
    children?: Block[];
  };
}

export interface ToDoBlock extends BaseBlock {
  type: 'to_do';
  to_do: {
    rich_text: RichText[];
    checked: boolean;
    color: ApiColor;
    children?: Block[];
  };
}

export interface ToggleBlock extends BaseBlock {
  type: 'toggle';
  toggle: {
    rich_text: RichText[];
    color: ApiColor;
    children?: Block[];
  };
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  quote: {
    rich_text: RichText[];
    color: ApiColor;
    children?: Block[];
  };
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  callout: {
    rich_text: RichText[];
    icon: Icon;
    color: ApiColor;
    children?: Block[];
  };
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  code: {
    rich_text: RichText[];
    caption: RichText[];
    language: string;
  };
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  divider: {};
}

export interface BreadcrumbBlock extends BaseBlock {
  type: 'breadcrumb';
  breadcrumb: {};
}

export interface TableOfContentsBlock extends BaseBlock {
  type: 'table_of_contents';
  table_of_contents: {
    color: ApiColor;
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  image: FileObject & {
    caption: RichText[];
  };
}

export interface BookmarkBlock extends BaseBlock {
  type: 'bookmark';
  bookmark: {
    url: string;
    caption: RichText[];
  };
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  embed: {
    url: string;
  };
}

export interface FileBlock extends BaseBlock {
  type: 'file';
  file: FileObject & {
    caption: RichText[];
    name: string;
  };
}

export interface ChildPageBlock extends BaseBlock {
  type: 'child_page';
  child_page: {
    title: string;
  };
}

export interface ChildDatabaseBlock extends BaseBlock {
  type: 'child_database';
  child_database: {
    title: string;
  };
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  table: {
    table_width: number;
    has_column_header: boolean;
    has_row_header: boolean;
  };
}

export interface TableRowBlock extends BaseBlock {
  type: 'table_row';
  table_row: {
    cells: RichText[][];
  };
}

export interface EquationBlock extends BaseBlock {
  type: 'equation';
  equation: {
    expression: string;
  };
}

export interface UnsupportedBlock extends BaseBlock {
  type: 'unsupported';
  unsupported: {};
}

// --- Zod Schema Definitions ---

const Block: z.ZodType<Block> = z.lazy(() =>
  z.discriminatedUnion('type', [
    ParagraphBlock,
    Heading1Block,
    Heading2Block,
    Heading3Block,
    BulletedListItemBlock,
    NumberedListItemBlock,
    ToDoBlock,
    ToggleBlock,
    QuoteBlock,
    CalloutBlock,
    CodeBlock,
    DividerBlock,
    BreadcrumbBlock,
    TableOfContentsBlock,
    ImageBlock,
    BookmarkBlock,
    EmbedBlock,
    FileBlock,
    ChildPageBlock,
    ChildDatabaseBlock,
    TableBlock,
    TableRowBlock,
    EquationBlock,
    UnsupportedBlock,
  ])
);

const ParagraphBlock = BaseBlock.extend({
  type: z.literal('paragraph'),
  paragraph: z.object({
    rich_text: z.array(RichText),
    color: ApiColor,
    children: z.array(Block).optional(),
  }),
});

const Heading1Block = BaseBlock.extend({
  type: z.literal('heading_1'),
  heading_1: z.object({
    rich_text: z.array(RichText),
    color: ApiColor,
    is_toggleable: z.boolean(),
  }),
});

const Heading2Block = BaseBlock.extend({
  type: z.literal('heading_2'),
  heading_2: z.object({
    rich_text: z.array(RichText),
    color: ApiColor,
    is_toggleable: z.boolean(),
  }),
});

const Heading3Block = BaseBlock.extend({
  type: z.literal('heading_3'),
  heading_3: z.object({
    rich_text: z.array(RichText),
    color: ApiColor,
    is_toggleable: z.boolean(),
  }),
});

const BulletedListItemBlock = BaseBlock.extend({
  type: z.literal('bulleted_list_item'),
  bulleted_list_item: z.object({
    rich_text: z.array(RichText),
    color: ApiColor,
    children: z.array(Block).optional(),
  }),
});

const NumberedListItemBlock = BaseBlock.extend({
  type: z.literal('numbered_list_item'),
  numbered_list_item: z.object({
    rich_text: z.array(RichText),
    color: ApiColor,
    children: z.array(Block).optional(),
  }),
});

const ToDoBlock = BaseBlock.extend({
  type: z.literal('to_do'),
  to_do: z.object({
    rich_text: z.array(RichText),
    checked: z.boolean(),
    color: ApiColor,
    children: z.array(Block).optional(),
  }),
});

const ToggleBlock = BaseBlock.extend({
  type: z.literal('toggle'),
  toggle: z.object({
    rich_text: z.array(RichText),
    color: ApiColor,
    children: z.array(Block).optional(),
  }),
});

const QuoteBlock = BaseBlock.extend({
  type: z.literal('quote'),
  quote: z.object({
    rich_text: z.array(RichText),
    color: ApiColor,
    children: z.array(Block).optional(),
  }),
});

const CalloutBlock = BaseBlock.extend({
  type: z.literal('callout'),
  callout: z.object({
    rich_text: z.array(RichText),
    icon: Icon,
    color: ApiColor,
    children: z.array(Block).optional(),
  }),
});

const CodeBlock = BaseBlock.extend({
  type: z.literal('code'),
  code: z.object({
    rich_text: z.array(RichText),
    caption: z.array(RichText),
    language: z.string(),
  }),
});

const DividerBlock = BaseBlock.extend({
  type: z.literal('divider'),
  divider: z.object({}),
});

const BreadcrumbBlock = BaseBlock.extend({
  type: z.literal('breadcrumb'),
  breadcrumb: z.object({}),
});

const TableOfContentsBlock = BaseBlock.extend({
  type: z.literal('table_of_contents'),
  table_of_contents: z.object({
    color: ApiColor,
  }),
});

const ImageBlock = BaseBlock.extend({
  type: z.literal('image'),
  image: FileObject.extend({
    caption: z.array(RichText),
  }),
});

const BookmarkBlock = BaseBlock.extend({
  type: z.literal('bookmark'),
  bookmark: z.object({
    url: z.string().url(),
    caption: z.array(RichText),
  }),
});

const EmbedBlock = BaseBlock.extend({
  type: z.literal('embed'),
  embed: z.object({
    url: z.string().url(),
  }),
});

const FileBlock = BaseBlock.extend({
  type: z.literal('file'),
  file: FileObject.extend({
    caption: z.array(RichText),
    name: z.string(),
  }),
});

const ChildPageBlock = BaseBlock.extend({
  type: z.literal('child_page'),
  child_page: z.object({
    title: z.string(),
  }),
});

const ChildDatabaseBlock = BaseBlock.extend({
  type: z.literal('child_database'),
  child_database: z.object({
    title: z.string(),
  }),
});

const TableBlock = BaseBlock.extend({
  type: z.literal('table'),
  table: z.object({
    table_width: z.number(),
    has_column_header: z.boolean(),
    has_row_header: z.boolean(),
  }),
});

const TableRowBlock = BaseBlock.extend({
  type: z.literal('table_row'),
  table_row: z.object({
    cells: z.array(z.array(RichText)),
  }),
});

const EquationBlock = BaseBlock.extend({
  type: z.literal('equation'),
  equation: z.object({
    expression: z.string(),
  }),
});

const UnsupportedBlock = BaseBlock.extend({
  type: z.literal('unsupported'),
  unsupported: z.object({}),
});

// ページコンテンツのレスポンス
const ListBlockChildrenResponse = z.object({
  type: z.literal('block'),
  block: z.object({}),
  object: z.literal('list'),
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
  results: z.array(Block),
});
export type ListBlockChildrenResponse = z.infer<typeof ListBlockChildrenResponse>;

// 型エクスポート
export type {
  BookmarkBlock,
  BulletedListItemBlock,
  CalloutBlock,
  ChildDatabaseBlock,
  ChildPageBlock,
  CodeBlock,
  EmbedBlock,
  EquationBlock,
  FileBlock,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  ImageBlock,
  NumberedListItemBlock,
  ParagraphBlock,
  QuoteBlock,
  TableBlock,
  TableRowBlock,
  ToDoBlock,
  ToggleBlock,
};

// Zodスキーマエクスポート
export { Block, ListBlockChildrenResponse };
