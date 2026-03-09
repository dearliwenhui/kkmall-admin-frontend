# Docker 构建故障排查

## 问题：构建失败 - 找不到 build 目录

### 错误信息

```
ERROR: Could not resolve "./build/plugins"
ERROR: Could not resolve "./build/optimize"
ERROR: Could not resolve "./build/utils"
```

### 原因

`build` 目录包含 Vite 构建配置文件，在 Docker 构建过程中是必需的：

```
build/
├── cdn.ts          # CDN 配置
├── compress.ts     # 压缩配置
├── info.ts         # 构建信息
├── optimize.ts     # 优化配置
├── plugins.ts      # Vite 插件配置
└── utils.ts        # 工具函数
```

这些文件被 `vite.config.ts` 引用，如果缺失会导致构建失败。

### 解决方案

更新 `.dockerignore` 文件，确保 `build` 目录被包含：

```dockerignore
# Dependencies
node_modules

# Build output (will be generated during Docker build)
dist
dist-ssr

# ... 其他配置 ...

# Note: Keep 'build' directory - it contains Vite build configuration files
```

**关键点**：
- ✅ 保留 `build/` 目录（构建配置）
- ❌ 排除 `dist/` 目录（构建输出）
- ❌ 排除 `node_modules/` 目录（依赖）

### 验证修复

本地测试构建：

```bash
cd kkmall-admin-frontend

# 测试 Docker 构建
docker build -t kkmall-admin-frontend:test .

# 如果成功，运行容器测试
docker run -p 8080:80 kkmall-admin-frontend:test

# 访问 http://localhost:8080
```

### 其他常见 Docker 构建问题

#### 1. 依赖安装失败

**症状**：
```
ERROR: failed to fetch ...
```

**解决**：
- 检查网络连接
- 使用国内镜像源（已配置 npmmirror.com）
- 增加超时时间

#### 2. 内存不足

**症状**：
```
FATAL ERROR: Reached heap limit Allocation failed
```

**解决**：
在 Dockerfile 中增加 Node.js 内存限制：

```dockerfile
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

#### 3. 构建超时

**症状**：
GitHub Actions 构建超时（默认 6 小时）

**解决**：
- 优化 Dockerfile（使用多阶段构建）
- 启用构建缓存
- 减少不必要的文件复制

#### 4. 多平台构建失败

**症状**：
ARM64 平台构建失败

**解决**：
暂时只构建 AMD64：

```yaml
# .github/workflows/docker-build.yml
platforms: linux/amd64
```

#### 5. pnpm 版本不兼容

**症状**：
```
ERROR: lockfile version mismatch
```

**解决**：
在 Dockerfile 中指定 pnpm 版本：

```dockerfile
RUN corepack prepare pnpm@9.0.0 --activate
```

### 最佳实践

1. **优化 .dockerignore**
   - 排除不必要的文件
   - 保留构建所需的配置文件
   - 减小构建上下文大小

2. **使用多阶段构建**
   - 构建阶段：安装依赖、编译代码
   - 生产阶段：只包含运行时文件
   - 减小最终镜像大小

3. **利用构建缓存**
   - 先复制 package.json 和 lock 文件
   - 再复制源代码
   - 依赖层可以被缓存

4. **本地测试**
   - 推送前本地测试构建
   - 使用 `docker build` 验证
   - 检查镜像大小和启动时间

### 当前配置状态

✅ `.dockerignore` 已更新
✅ `build/` 目录已保留
✅ 多阶段构建已配置
✅ pnpm 缓存已优化
✅ 国内镜像源已配置

### 下一步

1. **推送代码测试**
   ```bash
   git add .dockerignore
   git commit -m "fix: update .dockerignore to include build directory"
   git push origin master
   ```

2. **查看 GitHub Actions**
   - 访问 Actions 标签
   - 查看构建日志
   - 确认构建成功

3. **验证镜像**
   ```bash
   docker pull ghcr.io/your-username/kkmall-admin-frontend:latest
   docker run -p 8080:80 ghcr.io/your-username/kkmall-admin-frontend:latest
   ```

### 相关文档

- [Dockerfile 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [.dockerignore 文档](https://docs.docker.com/engine/reference/builder/#dockerignore-file)
- [多阶段构建](https://docs.docker.com/build/building/multi-stage/)