# 第一阶段：依赖安装和应用构建
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* ./

# 复制Prisma相关文件（用于生成客户端）
COPY prisma ./prisma/

# 安装依赖，使用生产模式并缓存
RUN npm ci && \
    npx prisma generate && \
    # 清理npm缓存，减小镜像大小
    npm cache clean --force

# 复制项目文件
COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# 第二阶段：运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

# 添加非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 直接从builder阶段复制node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# 复制启动脚本并设置权限
COPY start.sh ./
RUN chmod +x start.sh

# 复制必要文件（按照依赖顺序，减少层）
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 设置用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["./start.sh"] 