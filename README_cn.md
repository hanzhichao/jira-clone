<a name="readme-top"></a>

# 使用 Next.js 14 的全栈 Jira 克隆

![Full-stack Jira Clone using Next.js 14](/.github/images/img_main.png '使用 Next.js 14 的全栈 Jira 克隆')

> 📖 **English Version**: [README.md](./README.md)

## 目录

- [快速开始](#快速开始)
- [技术栈](#技术栈)
- [主要功能](#主要功能)
- [数据库脚本](#数据库脚本)
- [贡献](#贡献)
- [致谢](#致谢)

---

## 🚀 快速开始

### 1. 环境准备

确保已安装 **Git** 和 **Node.js** (v18+)。

### 2. 克隆并安装

```bash
git clone https://github.com/sanidhyy/jira-clone.git
cd jira-clone
npm install --legacy-peer-deps
```

### 3. 数据库配置

在项目根目录创建 `.env.local` 文件：

```env
# .env.local

# 禁用 Next.js 遥测（可选）
NEXT_TELEMETRY_DISABLED=1

# 应用基础 URL
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000

# =====================
# 数据库配置
# =====================
# 支持: sqlite, mysql, postgresql
DB_TYPE=sqlite

# SQLite（默认，无需额外配置）
# DB_PATH=./sqlite.db

# MySQL（如需使用 MySQL，取消注释并配置）
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=jira_clone

# PostgreSQL（如需使用 PostgreSQL，取消注释并配置）
# DB_TYPE=postgresql
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=jira_clone
```

### 4. 初始化数据库

```bash
# 创建数据库表并插入示例数据
npm run db:reset
```

这将创建：
- 2 个演示用户 (demo@example.com / password123)
- 1 个工作区、2 个项目、7 个任务
- 完整的 CRUD 功能

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 并使用以下凭据登录：
- **邮箱**: demo@example.com
- **密码**: password123

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 后端 API | Hono |
| 数据库 | **Drizzle ORM** + SQLite/MySQL/PostgreSQL (可配置) |
| 认证 | 基于 Cookie 的会话 + bcrypt |
| 状态管理 | TanStack Query v5 + nuqs |
| UI | Tailwind CSS + shadcn/ui-style + Radix 组件 |

---

## ✨ 主要功能

- ✅ **多数据库支持**: SQLite、MySQL、PostgreSQL 可切换
- ✅ **工作区管理**: 创建和切换工作区
- ✅ **项目与任务管理**: 看板视图，支持拖拽排序
- ✅ **日历视图**: 使用 react-big-calendar 可视化任务
- ✅ **成员角色**: 每个工作区支持管理员和成员角色
- ✅ **邀请系统**: 通过邀请码分享工作区
- ✅ **现代 UI**: 响应式设计，支持深色模式

---

## 📦 数据库脚本

| 命令 | 描述 |
|------|------|
| `npm run db:migrate` | 创建数据库表 |
| `npm run db:seed` | 插入示例数据 |
| `npm run db:reset` | 重置数据库（删除 + 重建 + 插入数据） |

### 指定数据库类型重置

```bash
# SQLite
npm run db:reset

# MySQL
DB_TYPE=mysql DB_HOST=localhost DB_USER=root DB_PASSWORD=xxx DB_NAME=jira_clone npm run db:reset

# PostgreSQL
DB_TYPE=postgresql DB_HOST=localhost DB_USER=postgres DB_PASSWORD=xxx DB_NAME=jira_clone npm run db:reset
```

---

## 🤝 贡献

使用本应用时可能会遇到一些 bug，欢迎提交 PR 进行修复。在提交前请确保遵循社区指南。

---

## 🙏 致谢

感谢以下资源和建议：

- CodeWithAntonio: https://codewithantonio.com/

---

## ⭐ 支持

如果这个项目对你有帮助，请给个 Star！

<br />
<p align="right">(<a href="#readme-top">返回顶部</a>)</p>