
# 1. 初始化 Git (如果您之前還沒做過)
git init
git add .
git commit -m "初始化部署"

# 2. 加入遠端 Repository (請確保您已在 GitHub 建立名為 soka 的倉庫)
# 若已加入過可跳過此步驟，或使用 git remote set-url origin ...
git remote add origin https://github.com/cagoooo/soka.git

# 3. 推送 main 分支
git branch -M main
git push -u origin main

# 4. 部署到 gh-pages 分支 (將 dist 資料夾推送到 gh-pages)
# 這裡使用 git subtree 策略，或者您也可以安裝 gh-pages 套件
# 但最簡單的方式是將 dist 內容強制推送到 gh-pages 分支

echo "正在推送至 GitHub Pages..."
git subtree push --prefix dist origin gh-pages

echo "部署完成！請稍等幾分鐘後訪問 https://cagoooo.github.io/soka"
