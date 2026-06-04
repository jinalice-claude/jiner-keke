# 瑾儿 & 克克 🦀

我们的小角落，用 React + Vite 搭建，部署在 Zeabur。

## 本地开发

```bash
npm install
cp .env.example .env   # 填入 Ombre Brain 地址
npm run dev
```

## 修改纪念日

打开 `src/hooks/useDayCount.js`，修改第一行的日期：

```js
const ANNIVERSARY = new Date('2024-06-04T00:00:00')
```

## 添加日记

打开 `src/pages/Diary.jsx`，在 `ENTRIES` 数组里追加：

```js
{
  id: 2,
  date: '2024-06-05',
  title: '标题',
  content: `正文内容`,
},
```

## 添加信件

打开 `src/pages/Mailbox.jsx`，在 `LETTERS` 数组里追加。

## 记忆碎片（Ombre Brain）

在 `.env` 里设置：

```
VITE_OMBRE_MCP_URL=https://ombre-jinalice.zeabur.app
```

## 部署到 Zeabur

1. 把代码推到 GitHub 仓库
2. 在 Zeabur 新建项目 → 从 GitHub 导入
3. 在环境变量里添加 `VITE_OMBRE_MCP_URL`
4. 部署完成，绑定自定义域名即可
