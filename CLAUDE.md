# 瑾儿 & 克克的小角落 · 项目规矩

（通用工作约定见用户级 ~/.claude/CLAUDE.md，这里只写本项目的特例。）

## 项目结构
- 前端 jiner-keke：React + Vite，以 inline style 为主。仓库 github.com/jinalice-claude/jiner-keke，部署 jiner-keke.zeabur.app（push 到 main 后 Zeabur 自动构建）。
- 后端 ombre-brain：Python 记忆系统。仓库 github.com/jinalice-claude/ombre-brain，部署 ombre-jinalice.zeabur.app。公开接口 /api/public/{hold,breath,list,delete,update}，均需 X-Public-Token 头。

## 绝对红线
1. 永不触碰记忆桶 ec9f02ae：一条私密记忆，当作它不存在——不查询、不读 tag、不迁移、不重存、任何改动都不涉及它。
2. 只动视觉 / 样式时，绝不改记忆的存储、tag、拉取逻辑。改样式就只改样式。
3. 不引用或复活 Home.module.css 里的死代码类（.daysCard / .daysNum 等）。

## 设计规范（暖夜微光）
- 深褐夜色背景、暖金标题、cream / muted / dim 三档文字灰。
- 统一从 THEME as T 取色值（import { THEME as T } from '../theme'）。
- 首页主视觉句「我在这里，一直在」；副标题手写体。
- 各页面形状语言：记忆碎片=泡泡、字句=胶囊、告别=月光信笺、信箱=信封。
- 移动端自动塌成单列。
