# GitHub Actions 工作流说明

## docker-build.yml - Docker 镜像构建和推送

### 触发条件

- **Push 事件**: 推送到 `master` 或 `main` 分支
- **Tag 事件**: 推送以 `v` 开头的标签（如 `v1.0.0`）
- **Pull Request**: 针对 `master` 或 `main` 分支的 PR

### 工作流程

1. **Checkout**: 检出代码
2. **Setup QEMU**: 设置 QEMU 以支持多平台构建
3. **Setup Buildx**: 设置 Docker Buildx
4. **Login**: 登录到 GitHub Container Registry (ghcr.io)
5. **Extract Metadata**: 提取镜像元数据和标签
6. **Build and Push**: 构建并推送 Docker 镜像

### 镜像标签策略

- **分支推送**: `ghcr.io/owner/repo:branch-name`
- **PR**: `ghcr.io/owner/repo:pr-123`
- **版本标签**: `ghcr.io/owner/repo:1.0.0`, `ghcr.io/owner/repo:1.0`
- **SHA**: `ghcr.io/owner/repo:branch-abc1234`
- **Latest**: `ghcr.io/owner/repo:latest` (仅默认分支)

### 多平台支持

构建支持以下平台：
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64)

### 缓存

使用 GitHub Actions 缓存 (GHA) 加速构建：
- `cache-from: type=gha` - 从缓存读取
- `cache-to: type=gha,mode=max` - 写入缓存（最大模式）

### 权限

需要以下权限：
- `contents: read` - 读取仓库内容
- `packages: write` - 推送镜像到 GHCR

### 使用说明

#### 1. 推送代码触发构建

```bash
git add .
git commit -m "feat: add new feature"
git push origin master
```

镜像将自动构建并推送到：
- `ghcr.io/owner/repo:master`
- `ghcr.io/owner/repo:master-abc1234`
- `ghcr.io/owner/repo:latest`

#### 2. 发布版本

```bash
git tag v1.0.0
git push origin v1.0.0
```

镜像将推送到：
- `ghcr.io/owner/repo:1.0.0`
- `ghcr.io/owner/repo:1.0`
- `ghcr.io/owner/repo:v1.0.0`

#### 3. 拉取镜像

```bash
# 拉取最新版本
docker pull ghcr.io/owner/repo:latest

# 拉取特定版本
docker pull ghcr.io/owner/repo:1.0.0

# 拉取特定分支
docker pull ghcr.io/owner/repo:master-abc1234
```

### 配置 GitOps 自动更新

如需在镜像构建后自动更新 GitOps 仓库，可以添加以下步骤：

```yaml
- name: Update GitOps Repository
  if: github.event_name == 'push' && github.ref == 'refs/heads/master'
  run: |
    git clone https://github.com/your-org/kkmall-gitops.git
    cd kkmall-gitops/apps/kkmall-admin-frontend/overlays/dev

    # 提取短 SHA
    SHORT_SHA=$(echo ${{ github.sha }} | cut -c1-7)

    # 更新镜像标签
    sed -i "s/newTag: .*/newTag: master-${SHORT_SHA}/" kustomization.yaml

    # 提交更改
    git config user.name "GitHub Actions"
    git config user.email "actions@github.com"
    git add kustomization.yaml
    git commit -m "chore: update frontend image to master-${SHORT_SHA}"
    git push
  env:
    GITHUB_TOKEN: ${{ secrets.GITOPS_PAT }}
```

注意：需要创建 Personal Access Token (PAT) 并添加到仓库 Secrets 中。

### 故障排查

#### 镜像推送失败

检查权限：
1. 确保仓库启用了 GitHub Packages
2. 确保工作流有 `packages: write` 权限
3. 检查 GITHUB_TOKEN 是否有效

#### 多平台构建失败

如果 ARM64 构建失败，可以暂时只构建 AMD64：

```yaml
platforms: linux/amd64
```

#### 构建超时

对于大型前端项目，可以：
1. 优化 Dockerfile（使用多阶段构建）
2. 使用 .dockerignore 排除不必要的文件
3. 启用构建缓存

### 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)