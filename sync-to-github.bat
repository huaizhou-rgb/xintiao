@echo off
chcp 65001 >nul
echo ====================================
echo 正在同步项目到 GitHub...
echo ====================================
echo.

REM 检查是否已初始化 Git 仓库
if not exist .git (
    echo [1/5] 初始化 Git 仓库...
    git init
    echo.
)

REM 检查远程仓库配置
echo [2/5] 配置远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/huaizhou-rgb/xintiao.git
echo.

REM 添加所有文件
echo [3/5] 添加文件到暂存区...
git add .
echo.

REM 创建提交
echo [4/5] 创建提交...
git commit -m "feat: 添加收入追踪器完整功能

- 实现实时收入计算和滚动动画
- 添加隐身模式（老板键）
- 支持咖啡休息暂停功能
- 暗色/亮色主题切换
- 里程碑通知系统
- Favicon 实时更新
- 每日目标进度追踪"
echo.

REM 检查当前分支
echo [5/5] 推送到 GitHub...
git branch -M main 2>nul
git push -u origin main
echo.

echo ====================================
echo 同步完成！
echo ====================================
pause

