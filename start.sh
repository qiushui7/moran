#!/bin/sh

# 等待数据库准备好
echo "等待数据库连接..."
# 增加等待时间和重试机制
MAX_RETRIES=30
RETRY_COUNT=0

until pg_isready -h db -U postgres || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  echo "等待PostgreSQL启动... ($RETRY_COUNT/$MAX_RETRIES)"
  RETRY_COUNT=$((RETRY_COUNT+1))
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "无法连接到数据库，超过最大重试次数"
  exit 1
fi

echo "数据库已就绪，继续执行..."

# 运行数据库操作
echo "执行数据库结构同步..."
npx prisma db push --accept-data-loss

# 如果需要执行迁移而不是db push，取消下面一行的注释
# npx prisma migrate deploy

# 启动应用
echo "启动应用..."
exec node server.js 