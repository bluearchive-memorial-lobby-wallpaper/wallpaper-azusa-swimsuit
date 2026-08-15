# Azusa (Swimsuit) 资产出处记录

> 核对日期：2026-08-15
> 范围：白洲梓（泳装）记忆大厅壁纸本地研究输入
> 原则：公开可访问不等于允许再分发；原文件保存在被 Git 忽略的
> `local-assets/original/`，构建时按 `research/checksums.sha256` 校验。

## 固定来源

| 来源 | 固定引用 | 本地用途 |
| --- | --- | --- |
| [kiraio-moe/Schale-Archive](https://github.com/kiraio-moe/Schale-Archive/tree/4172f080f7bef586ad5d4225891463caf44f91b9) | `4172f080f7bef586ad5d4225891463caf44f91b9` | `Azusa_swimsuit_home` Spine 模型、atlas、纹理 |
| [QuetzalSidera/StuArchive](https://github.com/QuetzalSidera/StuArchive/tree/1e7142f1439ba14a2952b719c32d8d698769e91f) | `1e7142f1439ba14a2952b719c32d8d698769e91f` | 学生 228、音乐 2/482、spine 371/1066 元数据与权利说明 |
| [arisu-archive/bluearchive-data](https://github.com/arisu-archive/bluearchive-data/tree/4ba8bd56518f55c5d4d50b324a9361279a48f808) | `4ba8bd56518f55c5d4d50b324a9361279a48f808` | 全球服 `CharacterDialogExcel` 的日/英/韩/繁中记忆大厅文本 |
| [EsotericSoftware/spine-runtimes 3.8](https://github.com/EsotericSoftware/spine-runtimes/tree/8b4844bd4b193ba9e54487ed397a777993cbad56) | `8b4844bd4b193ba9e54487ed397a777993cbad56` | 与 Spine 3.8 模型匹配的本地解析器（复用 Hare 缓存） |

官方网页规则（按 2026-08-10 Hare 记录核对）：

- [Yostar 日服二次创作指引](https://bluearchive.jp/news/newsJump/116)
- [Yostar 日服利用规则警示](https://bluearchive.jp/news/newsJump/131)
- [Yostar Fan Kit 使用注意](https://bluearchive.jp/fankit/Precautions)
- [Spine Runtimes License Agreement](https://esotericsoftware.com/spine-runtimes-license)

## 模型与纹理

固定目录：`Spine_Lobbies/Spr/Azusa_swimsuit_home`（Schale-Archive 固定提交）。

| 文件 | 字节数 | SHA-256 |
| --- | ---: | --- |
| `Azusa_swimsuit_home.skel` | 904,288 | `88432d5a655daaf1b27858ebd8f7018a045238f03685faf1d6dd0912095db0ce` |
| `Azusa_swimsuit_home.atlas` | 20,036 | `918458dc090c8d1869e64adde08ee3194935bc01bf43387d534c085f70eb42d6` |
| `Azusa_swimsuit_home.png` | 2,813,745 | `1a69cd0a3031d38b959817d66bcefedf6c0fa4a32279915d2a1518b086508fa5` |
| `Azusa_swimsuit_home2.png` | 2,330,583 | `03fd06349f0401afcea1d1cf7d058223566c5cf7367861331aaf3703a5781224` |

骨架头解析为 Spine `3.8.96`，与 runtime 的 3.8 解析器兼容
（`src/config.ts` 的 `spineVersion` 已如实声明为 `3.8.96`；调试面板顶部
显示的 `3.8.99` 是 runtime 版本标签，非骨架版本）。注意：Kivo Wiki 的
`Azusa_swimsuit_home_fix`（spine-1066）为 Spine 4.2 格式，当前 runtime
不兼容，故未采用。

## 语音、字幕与 BGM

元数据（StuArchive 固定提交）：

- [学生 228](https://github.com/QuetzalSidera/StuArchive/blob/1e7142f1439ba14a2952b719c32d8d698769e91f/data/students/228.json)
- [音乐 2](https://github.com/QuetzalSidera/StuArchive/blob/1e7142f1439ba14a2952b719c32d8d698769e91f/data/musics/2.json)
- [音乐 482（OST）](https://github.com/QuetzalSidera/StuArchive/blob/1e7142f1439ba14a2952b719c32d8d698769e91f/data/musics/482.json)
- [spine 371](https://github.com/QuetzalSidera/StuArchive/blob/1e7142f1439ba14a2952b719c32d8d698769e91f/data/spines/371.json)
- [spine 1066](https://github.com/QuetzalSidera/StuArchive/blob/1e7142f1439ba14a2952b719c32d8d698769e91f/data/spines/1066.json)
- [数据许可边界](https://github.com/QuetzalSidera/StuArchive/blob/1e7142f1439ba14a2952b719c32d8d698769e91f/LICENSE-DATA.md)
- [NOTICE](https://github.com/QuetzalSidera/StuArchive/blob/1e7142f1439ba14a2952b719c32d8d698769e91f/NOTICE.md)

### 语音

日语记忆大厅 10 条语音从 Kivo Wiki 静态文件下载（2026-08-15），逻辑 ID 为
`AzusaSwimsuit_MemorialLobby_N_M`，逐文件 SHA-256 记录在
`research/checksums.sha256`。

韩语语音同样来自 Kivo Wiki 静态文件：与晴（露营）相同的命名规律，基础目录
下的小写描述名文件即韩语录音（如 `azusaswimsuit_memoriallobby_1_1.ogg`），
2026-08-15 完成下载，与日语文件逐条不同。逐文件哈希：

| 文件 | 字节数 | SHA-256 |
| --- | ---: | --- |
| `azusaswimsuit_memoriallobby_1_1.ogg` | 16,957 | `fe87df61baccaccb4367a0c1e0b5f94761317fad8a34a246854d906776105713` |
| `azusaswimsuit_memoriallobby_1_2.ogg` | 53,234 | `1b987582e0b5b6d259cbb51ad7adb26970bcb9d47bcc93946f3610b823767919` |
| `azusaswimsuit_memoriallobby_2_1.ogg` | 44,825 | `b525fb83a901f568cd457cc857a48a33bd157e738b5af44d2eaaff7cca9cf82a` |
| `azusaswimsuit_memoriallobby_2_2.ogg` | 23,067 | `cf892be841c0ff5be296b045ea166124b8bf02d21efa2be4f331ed1bbe7122c8` |
| `azusaswimsuit_memoriallobby_3_1.ogg` | 38,346 | `30629df25df285387ed0f4d923c9f9766d7af0fe627bba020c2e222aed382c41` |
| `azusaswimsuit_memoriallobby_3_2.ogg` | 36,081 | `ed493c67216aa1778d1e869017af2c979ff675301796b2e1f538dff5bcb33550` |
| `azusaswimsuit_memoriallobby_4_1.ogg` | 29,235 | `8dc149209f8617df2dcf50002d06afd8a40c787d01df1372389481e89244e550` |
| `azusaswimsuit_memoriallobby_4_2.ogg` | 26,878 | `c05b4ccf9172e6cdc6039f3369e4426a8d3b764f15ef743686af96ecb5549706` |
| `azusaswimsuit_memoriallobby_5_1.ogg` | 33,883 | `3f26d02475d1aefcefed08d7c70ef3f1eed41a32b6f1a6d76b070f2e9dc002c5` |
| `azusaswimsuit_memoriallobby_5_2.ogg` | 28,330 | `a5246594737ebbfa4772e848922d4e9560693026198fb97b43539c4dc8c1be15` |

简中语音：Kivo Wiki 的 `/cn/` 目录仅覆盖部分学生（晴（露营）存在），白洲梓
（泳装）的语音并非按目录区分，而是 API
`/api/v1/data/students/228` 的 `voice_cn` 字段提供 hash 文件名。中文记忆大厅
10 条已按该字段下载至 `audio/zh-cn/`（2026-08-15）。逐文件哈希：

| 文件 | 字节数 | SHA-256 |
| --- | ---: | --- |
| `azusaswimsuit_memoriallobby_1_1.ogg` | 18,420 | `614bcebfbf8e2b9252f83cc4812eb6899b64ae008e9a4982abc0edb4affb0b37` |
| `azusaswimsuit_memoriallobby_1_2.ogg` | 69,195 | `3acb56c402b683d33a80f253796068ef04049c49e70c52f7ac1a9b40313ba581` |
| `azusaswimsuit_memoriallobby_2_1.ogg` | 55,376 | `a583b934f929ab1323a9768e5a2906e36954d1f782bc3c0e476c1cdb3a9f3531` |
| `azusaswimsuit_memoriallobby_2_2.ogg` | 26,102 | `b39070b6843214cb6a75d9b65452632954b11836c361d839ce17acdb6311dc25` |
| `azusaswimsuit_memoriallobby_3_1.ogg` | 44,928 | `28908cf36fe9d47131895bbeb911b868555ce5ecd2bea13087b828db77ca9c54` |
| `azusaswimsuit_memoriallobby_3_2.ogg` | 51,207 | `6d65770240e71070d9315c5066aed910511f446bf052b2dd5e0b9af3bba9948f` |
| `azusaswimsuit_memoriallobby_4_1.ogg` | 34,383 | `26b0fa81106e09e10a2f6bc04e0fafdbbbfa1677d6ae3a8636bb1990eb6cc436` |
| `azusaswimsuit_memoriallobby_4_2.ogg` | 29,106 | `a4b6bf9c51d935a7707fb2b9c747d1b9afbec33e2ab8e3361838beaa74bbd2a7` |
| `azusaswimsuit_memoriallobby_5_1.ogg` | 46,714 | `2a96e40ff8b5f829e504a74b5f7c26a6dd449efecef4bf929d0ddfea00dbf899` |
| `azusaswimsuit_memoriallobby_5_2.ogg` | 26,265 | `cb5bf723fe8aa3512faf7a038757c9d597c76a3f1320ad1acff67b427110f7dd` |

字幕文本：日文/简中取自 Kivo 学生 228 数据；韩文/英文/繁中取自全局服
`CharacterDialogExcel`（`character_id = 10021`、`dialog_category = 8`、
`display_order = 360..450`）。

### BGM

| 项目 | 记录 |
| --- | --- |
| 本地文件 | `local-assets/original/bgm/02 - Luminous Memory.flac`（构建为 `assets/azusa-swimsuit/bgm/02 - Luminous Memory.flac`） |
| 曲名 / 作曲 | `Luminous memory` / Mitsukiyo |
| 专辑 | 《Blue Archive Original Soundtrack Vol.1 ~Longing for the Memorable Days~》 |
| 大小 / SHA-256 | 19,459,013 B / `f6a05760c0174fd7590c498d435b0a3626d09d39f4f459d2eeaeccfa58ecdf4c` |
| 来源 | 项目所有者 2026-08-15 手动加入的官方 OST 无损 FLAC（网易云音乐下载，`ミツキヨ - Luminous Memory.flac`） |

游戏内曲目 `Theme_02.ogg`（同曲）作为回退来源记录在
`local-assets/original/manifests/music-2.json`；当前构建使用上述无损版。
该 FLAC 与 Hare 的无损 BGM 相同，只允许进入私有测试包；公开发布前需取得明确
许可或排除该文件。

## Spine Runtime

复用 Hare 项目缓存的官方 3.8 spine-ts 构建
（`8b4844bd4b193ba9e54487ed397a777993cbad56`）。构建时剥离其行尾
`sourceMappingURL` 注释（.map 未随包分发）。许可文本随包保留，见
`licenses/SPINE-RUNTIMES-LICENSE.txt`。

## 预览图

`public/preview.gif` 由 `scripts/generate-character-preview.mjs` 生成：以
headless Chrome 加载应用、渲染 `Idle_01` 待机动画的 8 个采样帧，按角色几何
包围盒裁剪并缩放为 256×256 动画 GIF（约 40KB），满足离线包校验约束。

## 发布状态

| 资源类别 | 结论 | 默认发布行为 |
| --- | --- | --- |
| Spine 模型、atlas、纹理 | 权利方为 NEXON / NEXON Games | 私有本地测试；公开发布前另行确认授权 |
| 日语语音 | 同上 | 私有本地测试 |
| 字幕文本 | 官方文本归权利方 | 私有本地测试 |
| `Theme_02.ogg` BGM | 不包含（除非取得明确许可） | 私有本地测试 |
| Spine 3.8 Runtime | 条件式可分发，待制作者 Spine 许可确认 | 未确认前仅本地评估 |
| 本项目原创 TypeScript/CSS/配置 | 可由项目作者自行授权 | 发布前选择项目许可证 |

Yostar 日服二创指引允许特定个人、非商业、日本国内的二次创作，但同时禁止直接
复制、采样游戏插画、视频、音声、乐曲等创作性较低的使用。Steam 创意工坊是全球
分发，不能把一般指引当作明确许可。此记录不是法律意见。
