# 白洲梓（泳装）Wallpaper Engine 壁纸

[English](README.md) | 简体中文

《蔚蓝档案》记忆大厅风格的 Web 壁纸项目，是 Hare (Camping) 完成运行时解耦后、
基于模板仓库创建的第一个角色项目。项目只保留角色专属内容：

- `src/config.ts`：角色内容定义（模型、动画、对话、语音、BGM）。
- `local-assets/original/`：本地原始资产（不进 Git），构建时校验哈希并拷贝。
- `public/`：Wallpaper Engine 元数据与发行说明。
- `research/`：资产出处与校验清单。

通用运行时与工具链通过 npm 依赖提供：

- `ba-memorial-lobby-wallpaper-runtime`：Spine 渲染、交互、对话、音频、设置、
  日志与调试面板。
- `ba-memorial-lobby-wallpaper-toolkit`：校验清单、离线打包等工具。

## 快速开始

```powershell
npm install
npm run generate:checksums   # 生成 local-assets 的 SHA-256 清单
npm run check                # 类型检查、回归测试、结构校验
npm run generate:character-preview  # 用 headless Chrome 渲染模型生成真实预览 GIF
npm run dev                  # 准备资产并启动 Vite 开发服务器
npm run build                # 准备资产、类型检查、构建并校验 dist/
npm run package:offline      # 生成确定性离线 ZIP
```

## 必须替换的占位符

从模板创建角色项目时，以下位置已替换为本角色内容；再次派生新角色时仍需替换：

| 位置 | 内容 |
| --- | --- |
| `src/config.ts` 中的 `PROJECT` | 项目 id、slug、标题、版本标识别 |
| `src/config.ts` 中的 `MODEL` | 模型路径、动画、骨骼/命中参数、设计视口 |
| `src/config.ts` 中的 `BGM` / `DIALOGUES` | BGM 文件与对话字幕内容 |
| `public/project.json` | 标题、描述、预览图、分级与标签 |
| `public/preview.gif` | 真实的 256×256 动画预览图 |
| `public/THIRD-PARTY-NOTICES.txt` | 真实资产的来源与许可记录 |
| `public/OFFLINE-README.txt` | 版本号与安装说明 |
| `research/PROVENANCE.md` | 每个二进制资产的来源与哈希记录 |

## 本地开发与构建

```powershell
npm install
npm run generate:checksums   # 生成 local-assets 的 SHA-256 清单
npm run check                # 类型检查、回归测试、结构校验
npm run dev                  # 准备资产并启动 Vite 开发服务器
npm run build                # 准备资产、类型检查、构建并校验 dist/
npm run package:offline      # 生成确定性离线 ZIP
```

资产准备、构建与校验细节见 [docs/ASSET-PIPELINE.md](docs/ASSET-PIPELINE.md)。

## 发行状态

项目已准备通过 Wallpaper Engine 编辑器发布至 Steam 创意工坊（发布时编辑器会
写入 `workshopid`）。`npm run package:offline` 仍可生成确定性的独立 ZIP。

## 资产说明

- 模型：Schale-Archive 固定提交中的 `Azusa_swimsuit_home`（Spine 3.8）。
- 语音：Kivo Wiki 的日语、韩语与简中记忆大厅语音（日语/简中为 hash 文件名，
  韩语为小写描述名）。
- BGM：OST 无损版 `Luminous Memory`（Vol.1，Mitsukiyo，FLAC）。
- 字幕：日文/简中取自 Kivo，韩文/英文取自全局服 `CharacterDialogExcel`。

逐项来源、哈希与权利归属见 [research/PROVENANCE.md](research/PROVENANCE.md)。

## 版权声明

本发行包中的《蔚蓝档案》角色模型、动画、立绘、语音、字幕文本与音乐等资产，
版权归其各自权利方（NEXON Games Co., Ltd.、Yostar 等《蔚蓝档案》相关权利方）
所有。本项目及其资产仅用于信息与教育目的，不用于任何商业用途；本项目为粉丝
自制项目，与上述公司无隶属、赞助或背书关系。若权利方要求，相关资产将被移除。

## 验证门禁

任何功能改动部署到 Wallpaper Engine 项目目录之前，必须先通过：

1. 外部 Chrome 端到端行为测试（含控制台错误检查）；
2. 真实 Wallpaper Engine 窗口测试（指针交互、属性回调、暂停/恢复）。

浏览器侧的 `?debug=1`、`?testWeInterfaces` 只是预检，不能替代真实 WE 窗口
测试。
