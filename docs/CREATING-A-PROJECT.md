# 从模板创建壁纸项目

本模板产生的项目是薄型消费者：它只拥有角色专属内容，所有行为都来自 runtime 与
toolkit 依赖。请按以下顺序完成替换。

## 1. 创建仓库

在 GitHub 使用 **Use this template** 创建新仓库，或者手动复制本仓库后重新 `git init`。
仓库建议命名为 `wallpaper-<character>`，例如 `wallpaper-hare-camping`。

## 2. 替换项目身份

编辑 `src/config.ts` 中的 `PROJECT`：

- `id`：稳定唯一标识，例如 `blue-archive-hare-camping`；发布后不要改名。
- `slug`：资产目录名，例如 `hare-camping`。
- `title`：壁纸显示名。
- `editionLabel`：版本标识，例如 `OFFLINE EDITION · 1.0.0`。

同步更新：

- `index.html` 的 `<title>`。
- `public/project.json` 的 `title` 与 `description`。
- `package.json` 的 `name`，以及 `package:offline` 输出文件名。
- `public/OFFLINE-README.txt` 的版本与安装说明。

## 3. 放入原始资产

原始二进制资源一律放在 `local-assets/original/`，不进 Git：

```text
local-assets/original/
  model/            # <slug>.skel、<slug>.atlas 与全部 PNG 页
  audio/<locale>/   # 每句台词的 <event-id>.ogg
  bgm/              # 固定 BGM 文件
```

然后用 `npm run inspect:spine` 检查模型实际包含的动画、骨骼与事件，把 `MODEL` 中的
占位值替换为真实名称。对话事件 id 必须与音频文件名一致（`voicePath` 会转小写）。

## 4. 生成校验清单

```powershell
npm run generate:checksums
npm run verify:checksums
```

`research/checksums.sha256` 记录所有原始文件的 SHA-256。每次新增或替换资源后都要重新
生成并提交清单。来源与许可记录写入 `research/PROVENANCE.md`。

## 5. 配置 Wallpaper Engine 元数据

编辑 `public/project.json`：

- `title`、`description`：壁纸展示文本（`validate:structure` 要求描述包含 "offline"）。
- `preview`：替换 `public/preview.gif` 为真实 256×256 动画预览。
- 分级、标签与可见性：按实际内容调整。
- 不要添加 `workshopid` / `workshopurl`；本模板面向私人离线发布。

属性结构、默认值、条件与分组由 runtime 的设置契约决定，请保持与模板一致；回归测试
`npm run test:settings` 会校验 `project.json` 默认值与 runtime 默认设置一致。

## 6. 本地运行与构建

```powershell
npm install
npm run dev          # http://127.0.0.1:5173/?debug=1
npm run check        # 类型检查 + 回归测试 + 结构校验
npm run build        # 准备资产、构建 dist/ 并校验
npm run package:offline
```

确定性 ZIP 输出到 `release/`。打包前确认 `package:offline` 中的 `--timestamp` 为本次
发布的实际时间。

## 7. 验证门禁

部署前必须完成两项硬性验证，并把过程记录在项目文档中：

1. **外部 Chrome 行为测试**：用用户已打开的外部 Chrome 打开 `http://127.0.0.1:4177/`
   （`npm run preview` 或构建后的静态服务），测试交互、调试面板、字幕与日志，并检查
   控制台无错误、无未捕获异常、无未处理拒绝。
2. **真实 Wallpaper Engine 窗口测试**：把构建产物导入 Wallpaper Engine 预览窗口，
   用真实指针/键盘操作验证交互，并通过宿主侧控件触发属性回调与暂停/恢复，确认渲染器
   健康与日志正常。

浏览器侧的 mock 与查询参数只是预检，不能替代 Wallpaper Engine 窗口测试。两项都通过后
才可以把构建产物复制或同步到正式壁纸项目目录。
