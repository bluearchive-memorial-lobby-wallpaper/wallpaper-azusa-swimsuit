# 更新模型

## 依赖更新

- runtime 修复与浏览器侧功能：通过 `ba-memorial-lobby-wallpaper-runtime` 的 npm 版本更新
  传播。
- 构建、测试、校验与打包改进：通过 `ba-memorial-lobby-wallpaper-toolkit` 的 npm 版本更新
  传播。
- 升级后运行 `npm run check`，并重新完成 Chrome 与 Wallpaper Engine 两项验证门禁。

模板中的版本契约（`package.json` 与 `scripts/validate-structure.mjs`）会在发布新版本时
同步更新；新建项目自动获得新结构。

## 模板变更如何生效

- **新建项目**：通过 GitHub template 自动获得最新结构。
- **已有项目**：不会自动接收模板结构变更。需要迁移时，按变更说明手动对照
  `docs/STRUCTURE.md` 应用；涉及行为的部分应优先升级 runtime/toolkit，而不是复制模板
  代码。

## 迁移注意

- `WallpaperDefinition.id`、对话 id 与 WE 用户属性键都是持久接口；发布后改名会破坏用户
  已保存的设置或音频事件关联。
- `schemaVersion` 用于内容契约演进；不兼容变更应提升 Schema 版本并提供迁移方式。
- `spineVersion` 只是内容声明；更换 Spine 运行时前必须确认与 `.skel` 版本匹配并满足
  分许可。
