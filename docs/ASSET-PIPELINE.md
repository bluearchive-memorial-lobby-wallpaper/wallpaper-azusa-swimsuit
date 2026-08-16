# 资产准备与发布流程

所有二进制资源（模型、纹理、音频、BGM、Spine 运行时）都不进 Git。它们作为本地构建
输入存在，发行包由本机构建生成。

## 输入布局

```text
local-assets/original/
  model/            # 原始 .skel/.atlas/PNG 页（保持不变）
  audio/<locale>/   # 每句台词的 .ogg
  bgm/              # 固定 BGM（FLAC）

generated-assets/
  model-4k/         # Real-CUGAN 2x 输出
  model-8k/         # Real-CUGAN 4x 输出

.cache/
  spine-runtimes-3.8/   # 固定的 Spine 3.8 spine-ts 构建
  realcugan/            # 本地 Real-CUGAN 工具
```

## 流程

1. **获取与记录**：只使用来源可验证的来源；把来源、提交号、SHA-256 与权利归属写入
   `research/PROVENANCE.md`。
2. **校验清单**：`npm run generate:checksums` 生成 `research/checksums.sha256`；
   `npm run verify:checksums` 回验。
3. **模型检查**：`npm run inspect:spine` 输出动画、骨骼、事件与交互候选，报告写入
   `research/spine-inspection.json`（不进 Git）。
4. **可选高清档位**：`npm run generate:model-textures` 用 Real-CUGAN 生成 4K/8K 页面，
   档位与缩放系数定义在 `scripts/lib/asset-layout.mjs` 的 `TIER_SCALES`。
5. **准备资产**：`npm run prepare:assets` 逐文件校验哈希后拷贝到
   `public/assets/<slug>/`，生成缩放 atlas，并复制固定的 Spine 运行时与许可到
   `public/vendor/`。
6. **构建与校验**：`npm run build` 运行 `vite build` 后由 `scripts/validate-dist.mjs`
   校验文件清单、元数据、预览、档位尺寸、OGG/FLAC 头、分发规则与 CEF 兼容性。
7. **打包**：`npm run package:offline` 用固定时间戳生成确定性 ZIP，包内含逐文件
   `MANIFEST.sha256`，并在 `release/` 生成整体校验和。
8. **发布**：正式版本通过 Wallpaper Engine 编辑器发布至 Steam 创意工坊（编辑器写入
   `workshopid` 并设置可见性）。

## 分发约束

- `dist/` 不得包含远程 URL、source map、缓存文件、原始研究文件或密钥路径。
- 发行包不是源码或原始资产备份；源码、固定输入与输出记录分别保存。
- Spine 运行时必须与 `.skel` 版本匹配（模板固定 3.8），并随包附许可文本。
- 版权声明随包保留：资产归其各自权利方所有，本项目及其资产仅用于信息与教育目的。
