# 📋 任务管理器

> 基于 Vue 3 + Tailwind CSS 的看板式任务管理应用

## ✨ 功能特性

- **任务增删改查** — 标题必填、描述选填
- **三种状态** — 待办 / 进行中 / 完成，三列看板展示
- **优先级三档** — 高（红）、中（黄）、低（绿）
- **拖拽改变状态** — 卡片在列间拖拽即更新状态
- **搜索筛选** — 按标题/描述关键字实时过滤
- **排序切换** — 按创建时间或优先级排序
- **深色模式** — 一键切换，刷新后保持选择
- **数据持久化** — 所有数据存入 localStorage
- **清空已完成** — 一键批量删除已完成任务
- **响应式布局** — 桌面/移动端均可使用

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 (Composition API) | 前端框架 |
| Vite | 构建工具 |
| Tailwind CSS v4 | 样式方案 |
| localStorage | 数据持久化 |

## 🚀 本地运行

```bash
# 安装依赖
cd task-manager
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🏗 项目结构

```
task-manager/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.js
    ├── style.css
    ├── App.vue
    ├── composables/
    │   ├── useTasks.js        # 任务 CRUD + 持久化
    │   └── useDarkMode.js     # 深色模式
    ├── components/
    │   ├── KanbanBoard.vue    # 看板主体（搜索/排序/拖拽）
    │   ├── TaskCard.vue       # 任务卡片
    │   ├── TaskForm.vue       # 新建/编辑弹窗
    │   ├── ConfirmDialog.vue  # 确认弹窗
    │   └── NavBar.vue         # 顶部导航栏
    └── utils/
        └── storage.js         # localStorage 封装
```

## 📄 License

MIT