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

不同于普通的 Todo 应用，TaskFlow Pro 独创了**"层级汇报体系"**。通过生成专属的汇报 ID，您可以轻松构建 A → B → C 的多级汇报关系。下级的任务状态将实时、自动地同步至上级的视图中，实现信息的无缝流转与高效管理。

## ✨ 核心特性

### 🔗 分布式层级汇报
- 支持任意深度的层级汇报关系（如：员工 → 经理 → 总监）
- 数据通过 P2P 网络实时透传，上级可随时掌握团队动态
- 单向向上汇报，避免数据回流和循环同步

### 🛡️ 隐私优先 & 数据安全
- 基于 PeerJS 的点对点通信，数据存储在本地（LocalStorage）
- 不经过任何中心化数据库，确保商业机密与个人隐私绝对安全
- 支持多个 STUN 服务器，提高 NAT 穿透成功率

### ⚡ 实时同步 & 高可靠性
- 采用单向向上汇报机制，避免任务重复和数据冲突
- 自动重试连接机制，最多重试 5 次，确保连接稳定
- 断线自动重连，支持网络波动场景

### 👥 用户身份管理
- 首次使用需设置用户名称，便于团队识别
- 固定的 Peer ID，重启后自动恢复连接
- 实时显示汇报人在线状态和连接数量

### 🎨 现代化界面设计
- **三栏布局**：左侧汇报人列表，中间任务管理，右侧统计面板
- 使用 Tailwind CSS 打造的现代化界面，支持 Glassmorphism 效果
- 响应式设计，完美适配桌面与移动端
- 流畅的过渡动画和交互反馈

### 📊 智能数据统计
- 实时统计总任务数、待处理、已完成、完成率
- 按汇报人分组显示任务数量
- 支持按来源筛选任务（全部、我自己、特定汇报人）

### 📱 便捷连接方式
- 扫描二维码快速建立汇报连接
- 支持手动输入 Peer ID 连接
- 自动保存连接信息，下次启动自动重连

## 🚀 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/liliang8858/TaskFlow-Pro.git

# 进入目录
cd TaskFlow-Pro

# 安装依赖
npm install
```

### 运行开发环境

```bash
npm run dev
```

浏览器访问 `http://localhost:5173` 即可开始使用。

### 构建生产版本

```bash
npm run build
```

## 🛠️ 技术栈

- **核心框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式方案**: Tailwind CSS + Lucide React Icons
- **通信协议**: PeerJS (WebRTC)
- **状态管理**: React Context + Hooks
- **工具库**: date-fns, clsx, tailwind-merge, qrcode.react

## 💡 使用指南

### 1. 首次使用
- 打开应用后，系统会要求输入您的名称
- 名称将用于在汇报网络中标识您的身份

### 2. 建立汇报关系

#### 作为汇报对象（上级）
1. 右侧面板会显示您的专属二维码和 ID
2. 将二维码或 ID 分享给下级
3. 下级连接后，您可以在左侧看到汇报人列表

#### 作为汇报人（下级）
1. 点击右上角 **"连接汇报对象"**
2. 扫描上级的二维码或输入 ID
3. 连接成功后，您的任务将自动同步给上级

### 3. 任务管理
- **创建任务**: 在中间区域输入任务内容，设置优先级和分类
- **管理任务**: 点击任务可标记完成，长按可编辑或删除
- **筛选查看**: 左侧可按来源筛选任务（全部、我自己、特定汇报人）

### 4. 查看统计
- 右侧统计面板实时显示任务完成情况
- 支持查看总任务数、待处理、已完成、完成率

### 5. 显示模式
- 访问 `?mode=display` 可进入大屏显示模式
- 适合会议室或公共区域展示团队任务概览

## 🔧 高级功能

### 多级汇报网络
支持构建复杂的汇报网络，例如：
```
员工A → 组长B → 经理C → 总监D
员工E → 组长B
员工F → 经理C
```

### 数据同步机制
- **单向向上**: 下级任务自动同步给上级，上级不会影响下级
- **实时更新**: 任务的增删改都会立即同步
- **智能合并**: 避免数据冲突和重复

### 连接管理
- **自动重连**: 网络断开后自动尝试重连
- **状态监控**: 实时显示连接状态和在线人数
- **固定身份**: Peer ID 固定，重启后保持身份不变

## 📄 许可证

本项目采用 MIT 许可证。

---

<div align="center">
  <p>Made with ❤️ by Trae</p>
  <p>如果这个项目对您有帮助，请给个 ⭐ Star 支持一下！</p>
</div>