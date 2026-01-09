<div align="center">
  <img src="public/logo.svg" alt="TaskFlow Pro Logo" width="120" height="120" />
  <h1>TaskFlow Pro</h1>
  
  <p>
    <strong>重新定义团队协作，构建去中心化的层级汇报网络。</strong>
  </p>

  <img src="public/cover.svg" alt="TaskFlow Pro Cover" width="100%" />

  <p align="center">
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://reactjs.org/">
      <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://peerjs.com/">
      <img src="https://img.shields.io/badge/PeerJS-P2P-orange?style=flat-square" alt="PeerJS" />
    </a>
    <a href="https://vitejs.dev/">
      <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    </a>
  </p>
  
  <p>
    <a href="README.en.md">English Documentation</a>
  </p>
</div>

## 📖 简介

**TaskFlow Pro** 是一款基于 WebRTC 技术构建的现代化分布式任务管理系统。它打破了传统中心化协作的限制，利用 P2P 技术实现数据的实时同步与隐私保护。

不同于普通的 Todo 应用，TaskFlow Pro 独创了**“层级汇报体系”**。通过生成专属的汇报 ID，您可以轻松构建 A → B → C 的多级汇报关系。下级的任务状态将实时、自动地同步至上级的视图中，实现信息的无缝流转与高效管理。

## ✨ 核心特性

- **🔗 分布式层级汇报**
  支持任意深度的层级汇报关系（如：员工 → 经理 → 总监）。数据通过 P2P 网络实时透传，上级可随时掌握团队动态。

- **🛡️ 隐私优先 & 数据安全**
  基于 PeerJS 的点对点通信，数据存储在本地（LocalStorage），不经过任何中心化数据库，确保您的商业机密与个人隐私绝对安全。

- **⚡ 实时双向同步**
  采用 Mesh/Tree 混合拓扑结构，任意节点的更新都会毫秒级同步至相关联的汇报对象，协作零延迟。

- **🎨 极致的 UI/UX 体验**
  使用 Tailwind CSS 打造的现代化界面，支持 Glassmorphism（毛玻璃）效果、流畅的过渡动画以及响应式设计，完美适配桌面与移动端。

- **📊 智能周报生成**
  内置周报生成器，一键汇总本周工作内容、完成情况及统计数据，支持 Markdown 格式导出，大幅提升汇报效率。

- **📱 扫码即连**
  无需复杂的配置，通过扫描二维码或输入简短 ID 即可快速建立汇报连接。

## 🚀 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/taskflow-pro.git

# 进入目录
cd taskflow-pro

# 安装依赖
npm install
```

### 运行开发环境

```bash
npm run dev
```

浏览器访问 `http://localhost:5173` 即可开始使用。

## 🛠️ 技术栈

- **核心框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式方案**: Tailwind CSS + Lucide React Icons
- **通信协议**: PeerJS (WebRTC)
- **状态管理**: React Context + Hooks
- **工具库**: date-fns, clsx, tailwind-merge

## 💡 使用指南

1.  **创建任务**: 在主界面输入任务内容，设置优先级和截止日期。
2.  **建立汇报关系**:
    *   **作为上级**: 点击右上角 **“接收汇报”**，获取您的专属 ID 或二维码。
    *   **作为下级**: 点击右上角 **“连接汇报对象”**，输入上级的 ID。
3.  **开始协作**: 连接成功后，下级的任务列表将自动同步至上级视图，任何变更实时更新。

## 📄 许可证

本项目采用 MIT 许可证。
