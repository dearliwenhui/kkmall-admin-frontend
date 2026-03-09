# KKMall 前端 GitHub Actions 配置完成

## 已创建的文件

### 1. GitHub Actions 工作流

**文件**: `.github/workflows/docker-build.yml`

**功能**: 自动构建并推送 Docker 镜像到 GitHub Container Registry (ghcr.io)

**触发条件**:
- Push 到 master/main 分支
- 创建 v* 版本标签（如 v1.0.0）
- Pull Request 到 master/main 分支

**镜像标签策略**:
- `master` - 最新的 master 分支构建
- `master-abc1234` - 带 commit SHA 的标签
- `latest` - 默认分支的最新版本
- `v1.0.0` - 版本标签
- `1.0` - 主次版本号
- `pr-123` - Pull Request 构建

**多平台支持**:
- linux/amd64 (x86_64)
- linux/arm64 (ARM64)

**构建优化**:
- 使用 GitHub Actions 缓存加速构建
- 支持多平台并行构建
- 自动提取镜像元数据

### 2. 文档

- `.github/workflows/README.md` - 工作流详细说明
- `.github/workflows/QUICKSTART.md` - 快速开始指南
- `.github/GITHUB_ACTIONS_SUMMARY.md` - GitHub Actions 总结

### 3. 已存在的配置

- `.dockerignore` - Docker 构建忽略文件（已优化）
- `Dockerfile` - 多阶段构建配置
- `.github/workflows/linter.yml` - 代码检查工作流
- `.github/workflows/pages.yml` - GitHub Pages 部署

## 使用指南

### 首次使用

#### 1. 启用 GitHub Packages

确保仓库启用了 GitHub Packages：
1. 访问仓库 Settings
2. 确认 Packages 功能已启用

#### 2. 推送代码触发构建

```bash
# 修改代码
git add .
git commit -m "feat: add new feature"

# 推送到 GitHub
git push origin master
```

#### 3. 查看构建状态

1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看 "Build and Push Docker Image" 工作流

#### 4. 查看构建的镜像

1. 访问仓库主页
2. 点击右侧 "Packages" 链接
3. 查看 kkmall-admin-frontend 镜像

### 发布新版本

```bash
# 创建版本标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0
```

镜像将自动构建并推送到：
- `ghcr.io/your-username/kkmall-admin-frontend:1.0.0`
- `ghcr.io/your-username/kkmall-admin-frontend:1.0`
- `ghcr.io/your-username/kkmall-admin-frontend:v1.0.0`

### 拉取和使用镜像

```bash
# 拉取最新版本
docker pull ghcr.io/your-username/kkmall-admin-frontend:latest

# 运行容器
docker run -d -p 8080:80 --name kkmall-frontend \
  ghcr.io/your-username/kkmall-admin-frontend:latest

# 访问应用
open http://localhost:8080
```

### 在 Kubernetes 中使用

镜像已经配置在 GitOps 仓库中：

```yaml
# gitops/apps/kkmall-admin-frontend/overlays/dev/kustomization.yaml
images:
- name: ghcr.io/dearliwenhui/kkmall-admin-frontend
  newTag: master-abc1234
```

更新镜像标签后，ArgoCD 会自动同步部署。

## 工作流程

### 完整的 CI/CD 流程

```
1. 开发者推送代码到 GitHub
   ↓
2. GitHub Actions 触发构建
   ↓
3. 构建 Docker 镜像（多平台）
   ↓
4. 推送镜像到 GHCR
   ↓
5. 手动或自动更新 GitOps 仓库
   ↓
6. ArgoCD 检测到变更
   ↓
7. 自动部署到 k3s 集群
   ↓
8. 应用更新完成
```

### 镜像标签示例

假设推送 commit `abc1234` 到 master 分支：

生成的镜像标签：
- `ghcr.io/username/kkmall-admin-frontend:master`
- `ghcr.io/username/kkmall-admin-frontend:master-abc1234`
- `ghcr.io/username/kkmall-admin-frontend:latest`

## 配置 GitOps 自动更新（可选）

如需在镜像构建后自动更新 GitOps 仓库：

### 1. 创建 Personal Access Token

1. 访问 GitHub Settings > Developer settings > Personal access tokens
2. 创建新 token，权限选择 `repo`
3. 复制 token

### 2. 添加到仓库 Secrets

1. 访问前端仓库 Settings > Secrets and variables > Actions
2. 点击 "New repository secret"
3. Name: `GITOPS_PAT`
4. Value: 粘贴 token

### 3. 修改 docker-build.yml

在 `.github/workflows/docker-build.yml` 末尾添加：

```yaml
      - name: Update GitOps Repository
        if: github.event_name == 'push' && github.ref == 'refs/heads/master'
        run: |
          # 克隆 GitOps 仓库
          git clone https://github.com/dearliwenhui/kkmall-gitops.git
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
          git push https://${{ secrets.GITOPS_PAT }}@github.com/dearliwenhui/kkmall-gitops.git
```

## 监控和维护

### 查看构建历史

1. 访问 Actions 标签
2. 选择 "Build and Push Docker Image"
3. 查看所有构建记录

### 添加状态徽章

在 README.md 中添加：

```markdown
![Docker Build](https://github.com/your-username/kkmall-admin-frontend/actions/workflows/docker-build.yml/badge.svg)
```

### 构建失败通知

GitHub 会自动发送邮件通知构建失败。也可以配置：
- Slack 通知
- Discord 通知
- 自定义 Webhook

## 故障排查

### 构建失败

1. **检查 Actions 日志**
   - 访问 Actions 标签
   - 点击失败的工作流
   - 查看详细错误信息

2. **本地测试构建**
   ```bash
   docker build -t test .
   ```

3. **常见问题**
   - 依赖安装失败：检查 package.json 和网络
   - 构建超时：优化 Dockerfile
   - 内存不足：减少并发构建

### 推送失败

1. **检查权限**
   - 确保工作流有 `packages: write` 权限
   - 检查 GITHUB_TOKEN 是否有效

2. **检查镜像名称**
   - 必须是小写
   - 格式: `ghcr.io/username/repo-name`

### 多平台构建失败

如果 ARM64 构建失败，可以暂时只构建 AMD64：

```yaml
platforms: linux/amd64
```

## 最佳实践

1. **使用语义化版本**
   - v1.0.0 - 主版本（不兼容的 API 变更）
   - v1.1.0 - 次版本（向后兼容的功能）
   - v1.1.1 - 补丁版本（向后兼容的 bug 修复）

2. **定期更新依赖**
   ```bash
   pnpm update
   ```

3. **优化构建时间**
   - 使用 .dockerignore 排除不必要的文件
   - 启用构建缓存
   - 使用多阶段构建

4. **安全扫描**
   - 定期扫描镜像漏洞
   - 使用最新的基础镜像
   - 不要在镜像中包含敏感信息

5. **标签管理**
   - 生产环境使用版本标签（v1.0.0）
   - 开发环境使用分支标签（master）
   - 测试环境使用 SHA 标签（master-abc1234）

## 下一步

1. **推送代码测试**
   ```bash
   git add .
   git commit -m "chore: add GitHub Actions for Docker build"
   git push origin master
   ```

2. **查看构建结果**
   - 访问 Actions 标签
   - 等待构建完成
   - 查看 Packages 中的镜像

3. **更新 GitOps 配置**
   ```bash
   cd gitops/apps/kkmall-admin-frontend/overlays/dev
   # 更新 newTag 为新构建的镜像标签
   vim kustomization.yaml
   ```

4. **部署到 k3s**
   ```bash
   kubectl apply -k gitops/apps/kkmall-admin-frontend/overlays/dev/
   ```

## 相关文档

- [GitHub Actions 工作流说明](workflows/README.md)
- [快速开始指南](workflows/QUICKSTART.md)
- [GitOps 部署文档](../../gitops/DEPLOYMENT_SUMMARY.md)
- [Dockerfile 说明](../Dockerfile)

## 总结

✅ GitHub Actions 工作流已配置
✅ 自动构建 Docker 镜像
✅ 多平台支持（amd64/arm64）
✅ 自动推送到 GHCR
✅ 支持版本标签
✅ 构建缓存优化
✅ 完整文档

现在可以推送代码到 GitHub，工作流将自动构建并推送 Docker 镜像！