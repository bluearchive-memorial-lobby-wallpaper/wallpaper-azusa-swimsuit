# 仓库结构

本模板对标 `wallpaper-hare-camping` 的薄型结构。角色专属内容集中在 `src/config.ts`，
构建与校验脚本由配置驱动，避免在多个文件中重复维护文件清单。

```text
.
├── index.html                  # 唯一入口：#app + 日志引导 + 内置 Spine 运行时
├── package.json                # 依赖与 npm 命令
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite + toolkit 插件（日志桥、运行时资产）
├── src/
│   ├── main.ts                 # 创建 runtime shell 并启动 App
│   ├── config.ts               # 角色内容唯一数据源：模型/动画/交互/对话/BGM
│   ├── logging/
│   │   └── WallpaperLogger.ts  # 角色侧日志器（持久日志引导 + 开发日志桥）
│   └── types/
│       ├── wallpaper-engine.d.ts   # WE 全局接口与调试接口声明
│       └── vite-env.d.ts           # Vite 客户端类型
├── public/
│   ├── project.json             # Wallpaper Engine 元数据与用户属性
│   ├── preview.gif              # 256×256 动画预览（占位，需替换）
│   ├── OFFLINE-README.txt       # 安装、完整性与版权说明
│   ├── THIRD-PARTY-NOTICES.txt  # 第三方资源与许可记录
│   ├── assets/                  # 构建时由 prepare:assets 生成，不进 Git
│   └── vendor/                  # 构建时生成的内置 Spine 运行时，不进 Git
├── licenses/
│   └── SPINE-RUNTIMES-LICENSE.txt  # Spine Runtime 官方许可（随包分发）
├── research/
│   ├── checksums.sha256         # 原始资产 SHA-256 清单（由 toolkit 生成）
│   └── PROVENANCE.md            # 资源来源/许可/处理记录
├── scripts/
│   ├── lib/                     # 共享工具：媒体解析、资产布局、配置加载
│   ├── prepare-assets.mjs       # 校验并拷贝资产到 public/，生成多档位
│   ├── validate-structure.mjs   # 无资产结构校验（模板自身健康检查）
│   ├── validate-dist.mjs        # 构建产物完整性与分发规则校验
│   ├── inspect-spine.mjs        # 导出 .skel 的动画/骨骼/事件报告
│   ├── generate-model-textures.mjs  # Real-CUGAN 生成 4K/8K 纹理档位
│   ├── generate-placeholder-preview.mjs  # 生成占位预览 GIF
│   └── test-*.mjs               # 无资产回归测试
├── docs/                        # 使用与流程文档
└── .github/workflows/ci.yml     # 无资产检查 + 有条件完整构建
```

## 归属边界

- **runtime 拥有**：Spine 渲染、交互、对话与字幕、音频生命周期、设置内核、WE 适配器、
  日志、调试面板与完整 DOM shell。
- **项目拥有**：模型/纹理/音频/预览资产、动画与骨骼名、命中参数、对话与字幕、BGM、
  标题与描述、Workshop 元数据、来源记录。
- **toolkit 拥有**：校验清单、分发校验、离线打包、Vite 插件与 CLI。

当行为问题属于 runtime 或 toolkit 时，在对应仓库修复并通过版本更新引入，不要在项目层
打补丁。
