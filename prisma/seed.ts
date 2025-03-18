import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 清理现有数据
  await prisma.post.deleteMany({})
  await prisma.tag.deleteMany({})

  // 创建标签
  const tagTech = await prisma.tag.create({
    data: {
      name: '技术',
      slug: 'tech',
    },
  })

  const tagLifestyle = await prisma.tag.create({
    data: {
      name: '生活',
      slug: 'lifestyle',
    },
  })

  const tagThoughts = await prisma.tag.create({
    data: {
      name: '思考',
      slug: 'thoughts',
    },
  })

  const tagDesign = await prisma.tag.create({
    data: {
      name: '设计',
      slug: 'design',
    },
  })

  // 创建文章
  await prisma.post.create({
    data: {
      title: 'Next.js 15 新特性介绍',
      slug: 'nextjs-15-new-features',
      content: `Next.js 15 带来了许多令人兴奋的新特性，大大提升了开发体验和应用性能。

React Server Components（RSC）是其中最重要的更新之一，它允许我们在服务器上渲染组件，减少客户端的JavaScript负担。这不仅提高了性能，还简化了数据获取流程。

另一个重要更新是改进的路由系统，支持嵌套布局和并行路由，使构建复杂界面变得更加直观。

Next.js 15还增强了图像和字体优化功能，自动进行处理以确保最佳性能和用户体验。

新版本中的Turbopack也得到了显著改进，编译速度比之前快了近10倍，使开发过程更加流畅高效。`,
      excerpt: 'Next.js 15带来了多项重要更新，包括React Server Components、改进的路由系统和更快的编译速度。',
      published: true,
      tags: {
        connect: [
          { id: tagTech.id },
          { id: tagDesign.id },
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: '如何使用Tailwind CSS构建响应式界面',
      slug: 'responsive-design-with-tailwind-css',
      content: `Tailwind CSS是一个功能强大的CSS框架，它采用实用优先的方法，让我们能够快速构建现代、响应式的网站。

使用Tailwind的最大优势在于它的类名系统直接对应于CSS属性，这使得我们无需编写自定义CSS就能实现复杂的设计。

响应式设计是现代网站的必要元素，Tailwind通过其断点前缀（如sm:、md:、lg:等）使这一过程变得简单。例如，\`class="text-sm md:text-base lg:text-lg"\`会根据屏幕尺寸自动调整文本大小。

Tailwind还提供了黑暗模式支持，只需添加\`dark:\`前缀就可以为黑暗模式指定不同的样式。

通过JIT（即时编译）模式，Tailwind现在变得更加轻量和高效，只生成你实际使用的CSS类。`,
      excerpt: '了解如何利用Tailwind CSS的强大功能快速构建美观、响应式的用户界面。',
      published: true,
      tags: {
        connect: [
          { id: tagTech.id },
          { id: tagDesign.id },
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: '数字极简主义：如何在数字时代保持专注',
      slug: 'digital-minimalism',
      content: `在这个充斥着无尽信息和不断通知的时代，数字极简主义成为了一种重要的生活理念。

数字极简主义不仅仅是关于减少使用设备的时间，更是关于有意识地选择哪些技术值得我们投入注意力。

实践数字极简主义的一些方法包括：设置特定的时间检查邮件和社交媒体，而不是随时响应；卸载不必要的应用；在手机上使用黑白显示模式减少吸引力；以及创建无干扰的工作环境。

通过减少数字噪音，我们可以找回深度工作的能力，提高创造力，甚至改善睡眠质量和整体幸福感。

最重要的是，数字极简主义让我们重新掌控自己的时间和注意力，而不是被技术所控制。`,
      excerpt: '探索如何在信息爆炸的时代实践数字极简主义，重获专注和平静。',
      published: true,
      tags: {
        connect: [
          { id: tagLifestyle.id },
          { id: tagThoughts.id },
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: 'PostgreSQL高级查询技巧',
      slug: 'postgresql-advanced-queries',
      content: `PostgreSQL是一个功能丰富的开源关系型数据库，提供了许多高级查询功能，可以大大提高数据处理效率。

Common Table Expressions (CTEs) 是PostgreSQL的一个强大特性，它允许我们创建临时结果集，使复杂查询更易于理解和维护。示例：\`WITH ranked_products AS (SELECT *, RANK() OVER (PARTITION BY category ORDER BY price) FROM products) SELECT * FROM ranked_products WHERE rank <= 3;\`

窗口函数（Window Functions）允许我们在不改变结果集行数的情况下执行计算，例如计算移动平均值或累计总和。

JSON支持是PostgreSQL的另一个亮点，它允许我们在关系型数据库中存储和查询JSON数据，结合了NoSQL的灵活性和关系型数据库的强大功能。

全文搜索功能使得PostgreSQL能够有效地搜索和排序文本内容，无需依赖外部搜索引擎。

最后，PostgreSQL的扩展系统允许添加新功能，如PostGIS用于地理空间数据处理，TimescaleDB用于时间序列数据等。`,
      excerpt: '掌握PostgreSQL的高级查询技巧，包括CTE、窗口函数、JSON处理和全文搜索。',
      published: true,
      tags: {
        connect: [
          { id: tagTech.id },
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: '极简主义设计原则',
      slug: 'minimalist-design-principles',
      content: `极简主义设计不仅仅是一种美学选择，更是一种注重清晰和功能的设计哲学。

"少即是多"是极简主义设计的核心理念。通过消除不必要的元素，我们可以突出真正重要的内容，创造出更有力的视觉表达。

空白空间（也称为负空间）在极简设计中扮演着至关重要的角色。它不仅提供了视觉上的喘息空间，还能引导用户的注意力。

颜色的使用在极简设计中通常受到限制，往往采用单色或有限的调色板，这有助于创造统一、和谐的视觉体验。

排版在极简设计中也至关重要，清晰的字体层次结构和谨慎的字体选择可以大大提升可读性和整体美感。

最后，对齐和网格系统为极简设计提供了必要的结构和秩序，即使在看似简单的设计中也能创造出复杂的和谐感。`,
      excerpt: '探索极简主义设计的核心原则，了解如何通过减法创造出更有力、更专注的用户体验。',
      published: true,
      tags: {
        connect: [
          { id: tagDesign.id },
          { id: tagThoughts.id },
        ],
      },
    },
  })

  console.log('数据库已成功填充示例数据')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 