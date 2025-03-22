#!/bin/sh

# 等待数据库准备好
echo "等待数据库启动..."
# 简单的延时等待数据库准备好
sleep 10
echo "假设数据库已就绪，继续执行..."

# 运行数据库操作
echo "执行数据库迁移..."
# 尝试执行迁移，如果失败则继续（不终止容器）
npx prisma migrate deploy || echo "迁移失败，但将继续启动应用"

# 启动应用
echo "启动应用..."
exec node server.js 