# Obsidian Editable Mindmap Plugin

## **Note**

- This library depends on jsMind: https://github.com/hizzgdev/jsmind
- [ ] TODO: run jest on github actions
- [ ] DnD support

##

This is a sample plugin for Obsidian (https://obsidian.md).

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in Typescript Definition format, which contains TSDoc comments describing what it does.

**Note:** The Obsidian API is still in early alpha and is subject to change at any time!

This sample plugin demonstrates some of the basic functionality the plugin API can do.
- Changes the default font color to red using `styles.css`.
- Adds a ribbon icon, which shows a Notice when clicked.
- Adds a command "Open Sample Modal" which opens a Modal.
- Adds a plugin setting tab to the settings page.
- Registers a global click event and output 'click' to the console.
- Registers a global interval which logs 'setInterval' to the console.

### First time developing plugins?

Quick starting guide for new plugin devs:

- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

### Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments.
- Publish the release.

### Adding your plugin to the community plugin list

- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

### How to use

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

### API Documentation

See https://github.com/obsidianmd/obsidian-api

## LICENSE

jsMind

    Copyright (c) 2014-2021, ZHANG ZHIGANG <hizzgdev@163.com>
    All rights reserved.
    
    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
    
    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
    
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    
    
    
    版权所有 (c) 2014-2021, 张志刚 <hizzgdev@163.com>
    保留一切权利。
    
    在满足下列条件的前提下，授予使用者使用及再发布本软件的源代码或二进制形式的权利，无论是否修改皆然：
    
    * 对于本软件源代码的再发布，必须保留上述的版权声明、此三条许可条件，以及下述的免责声明。
    * 对于本软件二进制形式的再发布，必须在随同提供的文档和/或其它媒介中，包含上述的版权声明、此三条许可条件，以及下述的免责声明。
    * 未获得事前书面许可，不得使用版权所有人的名称和贡献者的名字，来为本软件的衍生物做任何支持、认可或推广、促销的行为。
    
    此软件由版权所有者及贡献者以现状（"as is"）方式提供，本软件不负任何明示或暗示的担保责任，包括但不限于就适销性以及特定目的的适用性的暗示性担保。任何因使用本软件造成的，直接、间接、连带、特别、惩戒或任何结果的损害（包括但不限于替代商品及服务的采购，无法使用，数据丢失，盈利损失或业务中断等），无论任何条件、无论任何原因或任何责任推断、无论是否属于合同范畴、无论是否为严格赔偿责任或民事侵权行为（包括过失或其他原因）而起，即使在使用前已获告知可能会造成此类损害的情形下，版权所有者及贡献者均不负任何责任。
    
