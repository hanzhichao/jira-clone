<a name="readme-top"></a>

# Full-stack Jira Clone using Next.js 14

![Full-stack Jira Clone using Next.js 14](/.github/images/img_main.png 'Full-stack Jira Clone using Next.js 14')

> 📖 **中文版本**: [README_cn.md](./README_cn.md)

[![Ask Me Anything!](https://flat.badgen.net/static/Ask%20me/anything?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy 'Ask Me Anything!')
[![GitHub license](https://flat.badgen.net/github/license/sanidhyy/jira-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/jira-clone/blob/main/LICENSE 'GitHub license')
[![Maintenance](https://flat.badgen.net/static/Maintained/yes?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/jira-clone/commits/main 'Maintenance')
[![GitHub branches](https://flat.badgen.net/github/branches/sanidhyy/jira-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/jira-clone/branches 'GitHub branches')
[![Github commits](https://flat.badgen.net/github/commits/sanidhyy/jira-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/jira-clone/commits 'Github commits')
[![GitHub issues](https://flat.badgen.net/github/issues/sanidhyy/jira-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/jira-clone/issues 'GitHub issues')
[![GitHub pull requests](https://flat.badgen.net/github/prs/sanidhyy/jira-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/jira-clone/pulls 'GitHub pull requests')
[![Vercel status](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://clone-jira.vercel.app 'Vercel status')

<!-- Table of Contents -->
<details>

<summary>

# :notebook_with_decorative_cover: Table of Contents

</summary>

- [Folder Structure](#bangbang-folder-structure)
- [Getting Started](#toolbox-getting-started)
- [Screenshots](#camera-screenshots)
- [Tech Stack](#gear-tech-stack)
- [Stats](#wrench-stats)
- [Contribute](#raised_hands-contribute)
- [Acknowledgements](#gem-acknowledgements)
- [Buy Me a Coffee](#coffee-buy-me-a-coffee)
- [Follow Me](#rocket-follow-me)
- [Learn More](#books-learn-more)
- [Deploy on Vercel](#page_with_curl-deploy-on-vercel)
- [Give A Star](#star-give-a-star)
- [Star History](#star2-star-history)
- [Give A Star](#star-give-a-star)

</details>

## :bangbang: Folder Structure

Here is the folder structure of this app.

<!--- FOLDER_STRUCTURE_START --->
```bash
jira-clone/
  |- public/
  |- src/
    |-- app/
      |--- (auth)/
      |--- (dashboard)/
      |--- (standalone)/
      |--- api/
      |--- apple-icon.png
      |--- error.tsx
      |--- favicon.ico
      |--- globals.css
      |--- icon1.png
      |--- icon2.png
      |--- layout.tsx
      |--- not-found.tsx
    |-- components/
      |--- ui/
      |--- analytics-card.tsx
      |--- analytics.tsx
      |--- date-picker.tsx
      |--- dotted-separator.tsx
      |--- logo.tsx
      |--- mobile-sidebar.tsx
      |--- modal-provider.tsx
      |--- navbar.tsx
      |--- navigation.tsx
      |--- page-error.tsx
      |--- page-loader.tsx
      |--- projects.tsx
      |--- query-provider.tsx
      |--- responsive-modal.tsx
      |--- sidebar.tsx
      |--- source-code.tsx
      |--- workspaces-switcher.tsx
    |-- config/
      |--- db.ts
      |--- index.ts
    |-- features/
      |--- auth/
      |--- members/
      |--- projects/
      |--- tasks/
      |--- workspaces/
    |-- hooks/
      |--- use-confirm.tsx
      |--- use-debounce.ts
    |-- lib/
      |--- appwrite.ts
      |--- hono.ts
      |--- oauth.ts
      |--- session-middleware.ts
      |--- utils.ts
  |- .env.example
  |- .env/.env.local
  |- .eslintrc.json
  |- .gitignore
  |- .prettierrc.json
  |- .prettierrc.mjs
  |- bun.lockb
  |- components.json
  |- environment.d.ts
  |- next.config.mjs
  |- package.json
  |- postcss.config.mjs
  |- tailwind.config.ts
  |- tsconfig.json
  |- vercel.ts
```
<!--- FOLDER_STRUCTURE_END --->

<br />

## :toolbox: Getting Started

### 1. Prerequisites

Make sure **Git** and **Node.js** (v18+) are installed.

### 2. Clone & Install

```bash
git clone https://github.com/sanidhyy/jira-clone.git
cd jira-clone
npm install --legacy-peer-deps
```

### 3. Database Configuration

Create `.env.local` in the **root** directory with your database settings:

```env
# .env.local

# disable next.js telemetry (optional)
NEXT_TELEMETRY_DISABLED=1

# app base url
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000

# =====================
# Database Configuration
# =====================
# Supported: sqlite, mysql, postgresql
DB_TYPE=sqlite

# SQLite (default, no extra config needed)
# DB_PATH=./sqlite.db

# MySQL (uncomment and configure if using MySQL)
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=jira_clone

# PostgreSQL (uncomment and configure if using PostgreSQL)
# DB_TYPE=postgresql
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=jira_clone
```

### 4. Initialize Database

```bash
# Create tables and seed sample data
npm run db:reset
```

This creates:
- 2 demo users (demo@example.com / password123)
- 1 workspace, 2 projects, 7 tasks
- Full CRUD functionality

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 and login with:
- **Email**: demo@example.com
- **Password**: password123

---

## 🔧 Database Scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Create database tables |
| `npm run db:seed` | Insert sample data |
| `npm run db:reset` | Reset database (drop + migrate + seed) |

### Reset with specific database type

```bash
# SQLite
npm run db:reset

# MySQL
DB_TYPE=mysql DB_HOST=localhost DB_USER=root DB_PASSWORD=xxx DB_NAME=jira_clone npm run db:reset

# PostgreSQL
DB_TYPE=postgresql DB_HOST=localhost DB_USER=postgres DB_PASSWORD=xxx DB_NAME=jira_clone npm run db:reset
```

**NOTE:** Please make sure to keep your API keys and configuration values secure and do not expose them publicly.

## :camera: Screenshots

![Modern UI/UX](/.github/images/img1.png 'Modern UI/UX')

![Tasks Kanban View](/.github/images/img2.png 'Tasks Kanban View')

![Tasks Calendar View](/.github/images/img3.png 'Tasks Calendar View')

![Responsive Modals](/.github/images/img4.png 'Responsive Modals')

## :gear: Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Backend API | Hono |
| Database | **Drizzle ORM** + SQLite/MySQL/PostgreSQL (configurable) |
| Auth | Cookie-based sessions + bcrypt |
| State | TanStack Query v5 + nuqs |
| UI | Tailwind CSS + shadcn/ui-style + Radix primitives |

### Key Features

- ✅ **Multi-database support**: SQLite, MySQL, PostgreSQL
- ✅ **Workspace management**: Create and switch between workspaces
- ✅ **Project & Task management**: Kanban board with drag-and-drop
- ✅ **Calendar view**: Task visualization with react-big-calendar
- ✅ **Member roles**: Admin and Member roles per workspace
- ✅ **Invite system**: Share workspaces with invite codes
- ✅ **Modern UI**: Responsive design with dark mode support

## :wrench: Stats

[![Stats for Jira Clone](/.github/images/stats.svg 'Stats for Jira Clone')](https://pagespeed.web.dev/analysis?url=https://clone-jira.vercel.app/ 'Stats for Jira Clone')

## :raised_hands: Contribute

You might encounter some bugs while using this app. You are more than welcome to contribute. Just submit changes via pull request and I will review them before merging. Make sure you follow community guidelines.

## :gem: Acknowledgements

Useful resources and dependencies that are used in Jira Clone.

- Thanks to CodeWithAntonio: https://codewithantonio.com/
<!--- DEPENDENCIES_START --->
- [@babel/eslint-parser](https://www.npmjs.com/package/@babel/eslint-parser): ^7.25.9
- [@hello-pangea/dnd](https://www.npmjs.com/package/@hello-pangea/dnd): ^18.0.1
- [@hono/zod-validator](https://www.npmjs.com/package/@hono/zod-validator): ^0.7.0
- [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers): ^3.9.0
- [@radix-ui/react-avatar](https://www.npmjs.com/package/@radix-ui/react-avatar): ^1.1.1
- [@radix-ui/react-dialog](https://www.npmjs.com/package/@radix-ui/react-dialog): ^1.1.2
- [@radix-ui/react-dropdown-menu](https://www.npmjs.com/package/@radix-ui/react-dropdown-menu): ^2.1.2
- [@radix-ui/react-icons](https://www.npmjs.com/package/@radix-ui/react-icons): ^1.3.0
- [@radix-ui/react-label](https://www.npmjs.com/package/@radix-ui/react-label): ^2.1.0
- [@radix-ui/react-popover](https://www.npmjs.com/package/@radix-ui/react-popover): ^1.1.2
- [@radix-ui/react-scroll-area](https://www.npmjs.com/package/@radix-ui/react-scroll-area): ^1.2.0
- [@radix-ui/react-select](https://www.npmjs.com/package/@radix-ui/react-select): ^2.1.2
- [@radix-ui/react-separator](https://www.npmjs.com/package/@radix-ui/react-separator): ^1.1.0
- [@radix-ui/react-slot](https://www.npmjs.com/package/@radix-ui/react-slot): ^1.1.0
- [@radix-ui/react-tabs](https://www.npmjs.com/package/@radix-ui/react-tabs): ^1.1.1
- [@radix-ui/react-visually-hidden](https://www.npmjs.com/package/@radix-ui/react-visually-hidden): ^1.1.0
- [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query): ^5.59.16
- [@tanstack/react-table](https://www.npmjs.com/package/@tanstack/react-table): ^8.20.5
- [@trivago/prettier-plugin-sort-imports](https://www.npmjs.com/package/@trivago/prettier-plugin-sort-imports): ^6.0.0
- [@types/node](https://www.npmjs.com/package/@types/node): ^25
- [@types/react](https://www.npmjs.com/package/@types/react): ^18
- [@types/react-big-calendar](https://www.npmjs.com/package/@types/react-big-calendar): ^1.15.0
- [@types/react-dom](https://www.npmjs.com/package/@types/react-dom): ^18
- [@vercel/config](https://www.npmjs.com/package/@vercel/config): ^0.3.0
- [class-variance-authority](https://www.npmjs.com/package/class-variance-authority): ^0.7.0
- [clsx](https://www.npmjs.com/package/clsx): ^2.1.1
- [date-fns](https://www.npmjs.com/package/date-fns): ^4.1.0
- [eslint](https://www.npmjs.com/package/eslint): ^10
- [eslint-config-next](https://www.npmjs.com/package/eslint-config-next): 16.2.4
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier): ^10.0.1
- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier): ^5.2.1
- [hono](https://www.npmjs.com/package/hono): ^4.6.7
- [lucide-react](https://www.npmjs.com/package/lucide-react): ^1.7.0
- [next](https://www.npmjs.com/package/next): 14.2.35
- [next-themes](https://www.npmjs.com/package/next-themes): ^0.4.3
- [node-appwrite](https://www.npmjs.com/package/node-appwrite): ^17.0.0
- [nuqs](https://www.npmjs.com/package/nuqs): 1.19.1
- [postcss](https://www.npmjs.com/package/postcss): ^8
- [prettier](https://www.npmjs.com/package/prettier): ^3.3.3
- [prettier-plugin-tailwindcss](https://www.npmjs.com/package/prettier-plugin-tailwindcss): ^0.8.0
- [react](https://www.npmjs.com/package/react): ^18
- [react-big-calendar](https://www.npmjs.com/package/react-big-calendar): ^1.15.0
- [react-day-picker](https://www.npmjs.com/package/react-day-picker): 8.10.1
- [react-dom](https://www.npmjs.com/package/react-dom): ^18
- [react-hook-form](https://www.npmjs.com/package/react-hook-form): ^7.53.1
- [react-icons](https://www.npmjs.com/package/react-icons): ^5.3.0
- [react-use](https://www.npmjs.com/package/react-use): ^17.5.1
- [server-only](https://www.npmjs.com/package/server-only): ^0.0.1
- [sonner](https://www.npmjs.com/package/sonner): ^2.0.1
- [tailwind-merge](https://www.npmjs.com/package/tailwind-merge): ^3.0.1
- [tailwindcss](https://www.npmjs.com/package/tailwindcss): ^3.4.1
- [tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate): ^1.0.7
- [typescript](https://www.npmjs.com/package/typescript): ^6
- [vaul](https://www.npmjs.com/package/vaul): ^1.1.0
- [zod](https://www.npmjs.com/package/zod): ^3.23.8

<!--- DEPENDENCIES_END --->

## :coffee: Buy Me a Coffee

[<img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" width="200" />](https://www.buymeacoffee.com/sanidhy 'Buy me a Coffee')

## :rocket: Follow Me

[![Follow Me](https://img.shields.io/github/followers/sanidhyy?style=social&label=Follow&maxAge=2592000)](https://github.com/sanidhyy 'Follow Me')
[![Tweet about this project](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fx.com%2F_sanidhyy)](https://x.com/intent/tweet?text=Check+out+this+amazing+app:&url=https%3A%2F%2Fgithub.com%2Fsanidhyy%2Fjira-clone 'Tweet about this project')

## :books: Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## :page_with_curl: Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## :star: Give A Star

You can also give this repository a star to show more people and they can use this repository.

## :star2: Star History

<a href="https://star-history.com/#sanidhyy/jira-clone&Timeline">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=sanidhyy/jira-clone&type=Timeline&theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=sanidhyy/jira-clone&type=Timeline" />
  <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=sanidhyy/jira-clone&type=Timeline" />
</picture>
</a>

<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
