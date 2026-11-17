# 请不要离开

一个用途不明、会记住你如何回应的手机优先互动心理悬疑网页。

## 当前状态

这是第一版可玩原型，并非完整的 50–80 分钟正式游戏。包括触摸/拖动圆点、自由文字输入、预设关键词回应、分阶段视觉变化、有限的本地行为记忆、对话分支和结尾选择。

## 本地试玩

直接在浏览器打开 `index.html`。不需要安装依赖、服务器或 API 密钥。

## GitHub Pages

仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。工作流会在 main 分支更新时部署。

## 隐私

仅使用当前浏览器的 localStorage 保存进度和少量短句，不上传用户输入；页面内的「重新开始」会清除存档。

## 后续开发

完善事件调度器和状态机，扩展至 24 个独立互动事件，加入可访问性测试、分支叙事、长线回访和更多视觉场景。不要把当前原型误认为已实现完整设计。


Deployment: GitHub Pages via GitHub Actions (triggered after Pages configuration).
