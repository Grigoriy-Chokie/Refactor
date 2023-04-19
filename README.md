# Refactor

## Начало работы с репозиторием
Вся работа с темой происходит в ветке main

Для разработки темы нужно установить на устройство следующие программы:
1. GNUWin32 Zip [(только Windows)](http://downloads.sourceforge.net/gnuwin32/zip-3.0-setup.exe)
2. [Ruby 2.7 (x64) + Devkit](https://www.ruby-lang.org/en/downloads/) ([установщик для Windows](https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-2.7.6-1/rubyinstaller-devkit-2.7.6-1-x64.exe))
3. [Shopify CLI (v2.18+)](https://shopify.dev/themes/tools/cli/installation)
4. [Node.js (v14+)](https://nodejs.org/en/download/)
5. [Git](https://git-scm.com/downloads)

После первого клонирования репозитория нужно переключится на ветку `main`
```
git checkout main
```

и установить зависимости npm.
```
npm install
```


---


Далее нужно залогинится в Shopify CLI, если это еще не сделано
```
shopify login
```

После этого нужно переключится на нужный магазин 
```
shopify switch -s store-name
```


---


Компиляция и сервер запускаются в 2 вкладках терминала в таком порядке
```
npm run dev
npm run check
```

После переключения ветки в Git, компиляцию и сервер необходимо перезапустить.