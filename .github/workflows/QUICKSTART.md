# GitHub Actions 快速指南

## 构建 Docker 镜像

### 自动触发

推送代码到 master/main 分支会自动触发镜像构建：

```bash
git add .
git commit -m "feat: add new feature"
git push origin master
```

构建完成后，镜像将推送到：
- `ghcr.io/your-username/kkmall-admin-frontend:master`
- `ghcr.io/your-username/kkmall-admin-frontend:master-abc1234`
- `ghcr.io/your-username/kkmall-admin-frontend:latest`

### 发布版本

创建版本标签：

```bash
git tag v1.0.0
git push origin v1.0.0
```

镜像将推送到：
- `ghcr.io/your-username/kkmall-admin-frontend:1.0.0`
- `ghcr.io/your-username/kkmall-admin-frontend:1.0`

### 查看构建状态

1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看最新的工作流运行

### 拉取镜像

```bash
# 拉取最新版本
docker pull ghcr.io/your-username/kkmall-admin-frontend:latest

# 拉取特定版本
docker pull ghcr.io/your-username/kkmall-admin-frontend:1.0.0
```

### 本地测试

```bash
# 构建镜像
docker build -t kkmall-admin-frontend:test .

# 运行容器
docker run -p 8080:80 kkmall-admin-frontend:test

# 访问: http://localhost:8080
```

## 工作流文件

- **docker-build.yml**: Docker 镜像构建和推送
- **linter.yml**: 代码检查（ESLint、Prettier、Stylelint）
- **pages.yml**: GitHub Pages 部署

详细说明请查看 [README.md](./README.md)