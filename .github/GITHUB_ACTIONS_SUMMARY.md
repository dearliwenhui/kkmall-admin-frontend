# GitHub Actions 配置总结

## 已创建的工作流

### 1. docker-build.yml - Docker 镜像构建

**功能**: 自动构建并推送 Docker 镜像到 GitHub Container Registry

**触发条件**:
- Push 到 master/main 分支
- 创建 v* 标签
- Pull Request 到 master/main

**镜像标签**:
- `master` - 最新的 master 分支构建
- `master-abc1234` - 带 commit SHA 的标签
- `latest` - 默认分支的最新版本
- `v1.0.0` - 版本标签
- `pr-123` - Pull Request 构建

**多平台支持**:
- linux/amd64
- linux/arm64

### 2. linter.yml - 代码检查（已存在）

**功能**: 运行 ESLint、Prettier、Stylelint 检查代码质量

### 3. pages.yml - GitHub Pages（已存在）

**功能**: 部署到 GitHub Pages

## 使用指南

### 推送代码触发构建

```bash
# 1. 修改代码
git add .
git commit -m "feat: add new feature"

# 2. 推送到 GitHub
git push origin master

# 3. 查看构建状态
# 访问: https://github.com/your-username/kkmall-admin-frontend/actions
```

### 发布新版本

```bash
# 1. 创建版本标签
git tag v1.0.0

# 2. 推送标签
git push origin v1.0.0

# 3. 镜像将自动构建并推送
# ghcr.io/your-username/kkmall-admin-frontend:1.0.0
# ghcr.io/your-username/kkmall-admin-frontend:1.0
```

### 拉取镜像

```bash
# 拉取最新版本
docker pull ghcr.io/your-username/kkmall-admin-frontend:latest

# 拉取特定版本
docker pull ghcr.io/your-username/kkmall-admin-frontend:1.0.0

# 拉取特定 commit
docker pull ghcr.io/your-username/kkmall-admin-frontend:master-abc1234
```

### 本地运行

```bash
# 拉取镜像
docker pull ghcr.io/your-username/kkmall-admin-frontend:latest

# 运行容器
docker run -d -p 8080:80 --name kkmall-frontend \
  ghcr.io/your-username/kkmall-admin-frontend:latest

# 访问应用
open http://localhost:8080

# 查看日志
docker logs -f kkmall-frontend

# 停止容器
docker stop kkmall-frontend
docker rm kkmall-frontend
```

## 配置 GitOps 自动更新（可选）

如需在镜像构建后自动更新 GitOps 仓库，需要：

### 1. 创建 Personal Access Token

1. 访问 GitHub Settings > Developer settings > Personal access tokens
2. 创建新 token，权限选择 `repo`
3. 复制 token

### 2. 添加到仓库 Secrets

1. 访问仓库 Settings > Secrets and variables > Actions
2. 点击 "New repository secret"
3. Name: `GITOPS_PAT`
4. Value: 粘贴上面的 token

### 3. 修改 docker-build.yml

在文件末尾添加：

```yaml
      - name: Update GitOps Repository
        if: github.event_name == 'push' && github.ref == 'refs/heads/master'
        run: |
          # 克隆 GitOps 仓库
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
          git push https://${{ secrets.GITOPS_PAT }}@github.com/your-org/kkmall-gitops.git
```

## 故障排查

### 构建失败

1. **检查 Dockerfile**
   ```bash
   # 本地测试构建
   docker build -t test .
   ```

2. **查看构建日志**
   - 访问 Actions 标签
   - 点击失败的工作流
   - 查看详细日志

3. **常见问题**
   - 依赖安装失败：检查 package.json
   - 构建超时：优化 Dockerfile，使用缓存
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

## 监控和通知

### 添加构建状态徽章

在 README.md 中添加：

```markdown
![Docker Build](https://github.com/your-username/kkmall-admin-frontend/actions/workflows/docker-build.yml/badge.svg)
```

### 配置通知

在仓库 Settings > Notifications 中配置：
- Email 通知
- Slack 通知
- Discord 通知

## 最佳实践

1. **使用语义化版本**
   - v1.0.0 - 主版本
   - v1.1.0 - 次版本
   - v1.1.1 - 补丁版本

2. **定期更新依赖**
   ```bash
   pnpm update
   ```

3. **优化构建时间**
   - 使用 .dockerignore
   - 启用构建缓存
   - 使用多阶段构建

4. **安全扫描**
   - 定期扫描镜像漏洞
   - 使用最新的基础镜像
   - 不要在镜像中包含敏感信息

## 相关链接

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages)
- [GitOps 部署文档](../../../gitops/DEPLOYMENT_SUMMARY.md)