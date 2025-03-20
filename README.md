# 墨韵

这是一个基于Next.js开发的现代博客系统，包含前台展示和后台管理功能。

## 功能特点

### 前台功能
- 响应式设计，适配各种设备
- 博客文章展示
- 标签分类
- 关于页面
- 干净简洁的UI设计

### 后台管理
- 安全的登录系统
- 文章管理（新增、编辑、删除、发布/草稿）
- 标签管理
- Markdown编辑器支持

## 技术栈

- **前端框架**: Next.js (App Router)
- **样式**: Tailwind CSS
- **UI组件**: 自定义组件
- **图标**: Lucide React
- **数据库ORM**: Prisma
- **认证**: NextAuth.js
- **开发语言**: TypeScript

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 配置数据库

1. 复制 `.env.example` 到 `.env`，并根据你的数据库配置修改 `DATABASE_URL`

```bash
cp .env.example .env
```

2. 运行 Prisma 迁移，创建数据库表

```bash
npx prisma migrate dev --name init
```

### 开发环境运行

```bash
npm run dev

```

打开 [http://localhost:3000](http://localhost:3000) 查看前台页面。
访问 [http://localhost:3000/admin](http://localhost:3000/admin) 进入后台管理

### 生产环境构建

```bash
npm run build
npm start

```

## 项目结构

```
├── prisma/             # Prisma模型和迁移
├── public/             # 静态资源
├── src/                # 源代码
│   ├── app/            # Next.js App Router
│   │   ├── admin/      # 后台管理页面
│   │   ├── posts/      # 博客文章页面
│   │   ├── tags/       # 标签页面
│   │   ├── about/      # 关于页面
│   │   ├── layout.tsx  # 全局布局
│   │   └── page.tsx    # 首页
│   ├── components/     # 可复用组件
│   ├── lib/            # 工具函数和库
│   └── styles/         # 样式文件
├── package.json        # 项目依赖
└── tailwind.config.js  # Tailwind 配置
```

# Prisma 使用教程

本教程将详细介绍 Prisma ORM 在 Next.js 项目中的使用，包括 Schema 的定义、数据库迁移、以及使用 Prisma Client 进行数据操作。

## 目录

- [安装与设置](#安装与设置)
- [Schema 设计](#schema-设计)
- [数据库迁移](#数据库迁移)
- [使用 Prisma Client](#使用-prisma-client)
- [常用查询示例](#常用查询示例)
- [数据关系处理](#数据关系处理)
- [部署注意事项](#部署注意事项)

## 安装与设置

### 1. 安装必要的依赖

```bash
npm install @prisma/client
npm install prisma --save-dev
```

### 2. 初始化 Prisma

```bash
npx prisma init
```

这将创建：
- `prisma/schema.prisma`：定义数据模型的文件
- `.env`：存储数据库连接字符串的环境变量文件

### 3. 配置数据库连接

在 `.env` 文件中，设置您的数据库连接字符串：

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

## Schema 设计

### 基本语法

Prisma schema 是一个声明式的数据模型定义文件，使用 Prisma Schema Language (PSL) 编写。

```prisma
// 定义数据源
datasource db {
  provider = "postgresql" // 可选: mysql, sqlite, sqlserver, mongodb
  url      = env("DATABASE_URL")
}

// 定义生成器
generator client {
  provider = "prisma-client-js"
}

// 定义模型
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 字段类型

Prisma 支持多种数据类型：

- 标量类型：`String`, `Boolean`, `Int`, `Float`, `DateTime`, `Json` 等
- 数组类型：`String[]`, `Int[]` 等（仅 PostgreSQL 支持）
- 枚举类型：自定义枚举
- 关系类型：通过 `@relation` 指定

### 字段修饰符

- `?`：表示可选字段
- `[]`：表示一对多或多对多关系
- `@id`：主键
- `@unique`：唯一约束
- `@default`：默认值
- `@map`：映射到数据库中的字段名
- `@db.Text`：指定数据库特定类型

### 关系定义

1. **一对一关系**

```prisma
model User {
  id      String  @id @default(cuid())
  profile Profile?
}

model Profile {
  id     String @id @default(cuid())
  user   User   @relation(fields: [userId], references: [id])
  userId String @unique
}
```

2. **一对多关系**

```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

3. **多对多关系**

```prisma
model Post {
  id     String   @id @default(cuid())
  tags   Tag[]    @relation("PostToTag")
}

model Tag {
  id     String @id @default(cuid())
  posts  Post[] @relation("PostToTag")
}
```

### 复合唯一约束

```prisma
model Tag {
  id     String @id @default(cuid())
  name   String
  slug   String
  userId String
  user   User   @relation(fields: [userId], references: [id])

  @@unique([slug, userId]) // 每个用户的标签slug唯一
  @@unique([name, userId]) // 每个用户的标签名称唯一
}
```

## 数据库迁移

### 创建迁移

```bash
# 创建迁移文件
npx prisma migrate dev --name init

# 指定名称的迁移
npx prisma migrate dev --name add_user_fields
```

### 应用迁移

```bash
# 开发环境（会清除数据）
npx prisma migrate dev

# 生产环境（不会清除数据）
npx prisma migrate deploy
```

### 重置数据库

```bash
npx prisma migrate reset
```

### 数据库检查

```bash
npx prisma db pull  # 从数据库获取结构更新schema
npx prisma validate # 验证schema
```

## 使用 Prisma Client

### 初始化客户端

创建 `lib/prisma.ts` 文件：

```typescript
import { PrismaClient } from '@prisma/client'

// 防止开发环境下热重载创建多个实例
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 在项目中导入

```typescript
import { prisma } from '@/lib/prisma'
```

## 常用查询示例

### 创建记录

```typescript
// 创建单条记录
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: '用户名',
  },
})

// 创建带关联的记录
const userWithPosts = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: '用户名',
    posts: {
      create: [
        { title: '第一篇文章', content: '内容...' },
        { title: '第二篇文章', content: '内容...' },
      ],
    },
  },
  include: {
    posts: true, // 返回结果包含关联的posts
  },
})

// 批量创建
const createdTags = await prisma.tag.createMany({
  data: [
    { name: '标签1', slug: 'tag-1', userId: 'user-id' },
    { name: '标签2', slug: 'tag-2', userId: 'user-id' },
  ],
  skipDuplicates: true, // 跳过唯一约束冲突的记录
})
```

### 查询记录

```typescript
// 查询单条记录
const user = await prisma.user.findUnique({
  where: {
    id: 'user-id',
  },
})

// 查询第一条匹配的记录
const firstUserWithName = await prisma.user.findFirst({
  where: {
    name: '用户名',
  },
})

// 查询多条记录
const users = await prisma.user.findMany({
  where: {
    email: {
      endsWith: '@example.com',
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10, // 限制返回数量
  skip: 20, // 分页偏移
})

// 过滤器组合
const filteredPosts = await prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      {
        OR: [
          { title: { contains: '关键词' } },
          { content: { contains: '关键词' } },
        ],
      },
    ],
  },
})

// 包含关联
const userWithPosts = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    },
    profile: true,
  },
})

// 选择字段
const userEmails = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
  },
})

// 聚合查询
const postStats = await prisma.post.aggregate({
  _count: {
    id: true, // 总数
  },
  _avg: {
    viewCount: true, // 平均浏览数
  },
  where: {
    published: true,
  },
})

// 分组统计
const postsByAuthor = await prisma.post.groupBy({
  by: ['authorId'],
  _count: {
    id: true,
  },
  having: {
    id: {
      _count: {
        gt: 5,
      },
    },
  },
})

// 嵌套计数
const tagsWithPostCount = await prisma.tag.findMany({
  include: {
    _count: {
      select: { posts: true }
    }
  }
})
```

### 更新记录

```typescript
// 更新单条记录
const updatedUser = await prisma.user.update({
  where: {
    id: 'user-id',
  },
  data: {
    name: '新用户名',
  },
})

// 更新多条记录
const publishedPosts = await prisma.post.updateMany({
  where: {
    authorId: 'user-id',
    published: false,
  },
  data: {
    published: true,
  },
})

// 更新或创建 (upsert)
const upsertUser = await prisma.user.upsert({
  where: {
    email: 'user@example.com',
  },
  update: {
    name: '更新的名字',
  },
  create: {
    email: 'user@example.com',
    name: '新用户',
  },
})

// 更新关联
const userWithNewPost = await prisma.user.update({
  where: { id: 'user-id' },
  data: {
    posts: {
      create: {
        title: '新文章',
        content: '内容...',
      },
      update: {
        where: { id: 'post-id' },
        data: { published: true },
      },
      delete: {
        id: 'post-to-delete',
      },
    },
  },
})
```

### 删除记录

```typescript
// 删除单条记录
const deletedUser = await prisma.user.delete({
  where: {
    id: 'user-id',
  },
})

// 删除多条记录
const deletedOldPosts = await prisma.post.deleteMany({
  where: {
    createdAt: {
      lt: new Date('2023-01-01'),
    },
  },
})

// 级联删除 (通过模型关系配置)
// 在schema中添加 onDelete: Cascade
```

## 数据关系处理

### 关联查询与过滤

```typescript
// 查询包含特定关联的记录
const usersWithPublishedPosts = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        published: true,
      },
    },
  },
})

// 关联过滤器
const posts = await prisma.post.findMany({
  where: {
    author: {
      email: {
        endsWith: '@example.com',
      },
    },
    tags: {
      some: {
        name: '技术',
      },
    },
  },
})
```

### 多级关联加载

```typescript
const usersWithPostsAndTags = await prisma.user.findMany({
  include: {
    posts: {
      include: {
        tags: true,
      },
    },
  },
})
```

## 事务处理

### 嵌套写入

Prisma的嵌套写入自动使用事务：

```typescript
const result = await prisma.user.create({
  data: {
    email: 'user@example.com',
    posts: {
      create: [
        { title: '文章1' },
        { title: '文章2' },
      ],
    },
  },
})
```

### 显式事务

```typescript
const [user, post] = await prisma.$transaction([
  prisma.user.create({
    data: {
      email: 'user@example.com',
    },
  }),
  prisma.post.create({
    data: {
      title: '标题',
      authorId: '预先知道的ID',
    },
  }),
])
```

### 交互式事务

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 在事务中使用tx替代prisma
  const user = await tx.user.create({
    data: {
      email: 'user@example.com',
    },
  })
  
  const post = await tx.post.create({
    data: {
      title: '标题',
      authorId: user.id,
    },
  })
  
  return { user, post }
}, {
  timeout: 5000, // 5秒超时
  maxWait: 2000, // 最大等待时间
})
```

## 数据库种子

### 创建种子脚本

在 `prisma/seed.ts` 中：

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 清除现有数据
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()
  
  // 创建用户
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '管理员',
      posts: {
        create: [
          {
            title: '第一篇文章',
            content: '内容...',
            published: true,
          },
          {
            title: '第二篇文章',
            content: '内容...',
            published: false,
          },
        ],
      },
    },
  })
  
  console.log(`已创建用户: ${user.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 配置包管理器运行种子脚本

在 `package.json` 中添加：

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### 运行种子脚本

```bash
npx prisma db seed
```

## Prisma Studio

启动可视化数据库管理工具：

```bash
npx prisma studio
```

这将在浏览器中打开一个界面，可以查看和编辑数据库中的数据。

## 其他常用命令

```bash
# 生成Prisma客户端（模型变更后）
npx prisma generate

# 格式化schema文件
npx prisma format

# 查看迁移历史
npx prisma migrate dev --create-only
```

## 部署注意事项

### 生产环境部署

```bash
# 部署迁移（不会重置数据）
npx prisma migrate deploy

# 生成prisma客户端
npx prisma generate
```

### 数据库连接池

对于高流量应用，考虑使用连接池：

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  connectionLimit: {
    min: 5,
    max: 20,
  },
})
```

### 数据库迁移策略

1. **生产环境升级步骤**：
   - 备份数据库
   - 运行 `npx prisma migrate deploy`
   - 运行应用的新版本

2. **避免破坏性更改**：
   - 添加新字段时设为可选或提供默认值
   - 删除字段前先将其标记为废弃
   - 使用包含零停机时间的蓝绿部署

## 资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma 示例](https://github.com/prisma/prisma-examples)
- [Prisma Data Platform](https://cloud.prisma.io)

## 故障排除

### 常见问题

1. **P2022: 表不存在**
   - 运行 `npx prisma migrate dev` 以应用迁移

2. **P2025: 记录不存在**
   - 检查查询条件，使用 `findFirst` 代替 `findUnique`，或添加适当的错误处理

3. **客户端未生成**
   - 运行 `npx prisma generate` 生成最新客户端

4. **数据库连接问题**
   - 检查 `.env` 文件中的连接字符串
   - 确保数据库服务正在运行
   - 检查网络访问权限和防火墙设置



