import {
	App,
	MarkdownView, Menu,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting, TextFileView, TFile, TFolder,
	View,
	ViewState,
	WorkspaceLeaf
} from 'obsidian';
import { around } from "monkey-around";
import { frontMatterKey } from "./parser";

const EDITABLE_MARKDOWN_ICON = 'blocks';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

const MINDMAP_VIEW_TYPE = "editable-markdown";


class EditableMindmapView extends TextFileView  {
	private plugin: MyPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
		super(leaf)
		this.plugin = plugin;
		console.log("EditableMindmapView constructor")
	}

	getDisplayText(): string {
		return this.file?.basename || "Kanban";
	}

	getViewType(): string {
		return MINDMAP_VIEW_TYPE;
	}

	clear(): void {
	}

	getViewData(): string {
		return this.data;
	}

	onMoreOptionsMenu(menu: Menu) {
		// Add a menu item to force the board to markdown view
		menu
				.addItem((item) => {
					item
							.setTitle("Open as markdown")
							.setIcon("document")
							.onClick(() => {
								this.plugin.mindmapFileModes[
								(this.leaf as any).id || this.file.path
										] = "markdown";
								this.plugin.setMarkdownView(this.leaf);
							});
				})
				.addSeparator();

		super.onMoreOptionsMenu(menu);
	}


	setViewData(data: string, clear: boolean): void {
		console.log("資格資格資格資格資格 SET VIEW DATA")
		console.log(data)
		console.log(clear)
		this.contentEl.createDiv({text: 'hello~'})
		this.contentEl.createEl('pre', {text: data})
		this.data = data;
	}

}

export default class MyPlugin extends Plugin {
	mindmapFileModes: { [file: string]: string } = {};
	settings: MyPluginSettings;

	async onload() {
		console.log('loading  obsidian-editable-markdown plugin');

		await this.loadSettings();

		this.addRibbonIcon('dice', 'Sample Plugin', () => {
			new Notice('This is a notice!');
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		const self = this; // TODO REMOVE

		// Monkey patch WorkspaceLeaf to open Mindmap with KanbanView by default
		this.register(
				around(WorkspaceLeaf.prototype, {
					// Mindmaps can be viewed as markdown or mindmap, and we keep track of the mode
					// while the file is open. When the file closes, we no longer need to keep track of it.
					detach(next) {
						return function () {
							const state = this.view?.getState();

							if (state?.file && self.mindmapFileModes[this.id || state.file]) {
								delete self.mindmapFileModes[this.id || state.file];
							}

							return next.apply(this);
						};
					},

					setViewState(next) {
						return function (state: ViewState, ...rest: any[]) {
							if (
									// If we have a markdown file
									state.type === "markdown" &&
									state.state?.file &&
									// And the current mode of the file is not set to markdown
									self.mindmapFileModes[this.id || state.state.file] !== "markdown"
							) {
								// Then check for the mindmap frontMatterKey
								const cache = self.app.metadataCache.getCache(state.state.file);

								if (cache?.frontmatter && cache.frontmatter[frontMatterKey]) {
									// If we have it, force the view type to kanban
									const newState = {
										...state,
										type: MINDMAP_VIEW_TYPE,
									};

									self.mindmapFileModes[state.state.file] = MINDMAP_VIEW_TYPE;

									return next.apply(this, [newState, ...rest]);
								}
							}

							return next.apply(this, [state, ...rest]);
						};
					},
				})
		);


		// Add a menu item to go back to kanban view
		this.register(
				around(MarkdownView.prototype, {
					onMoreOptionsMenu(next) {
						return function (menu: Menu) {
							const file = this.file;
							const cache = file
									? self.app.metadataCache.getFileCache(file)
									: null;

							if (
									!file ||
									!cache?.frontmatter ||
									!cache.frontmatter[frontMatterKey]
							) {
								return next.call(this, menu);
							}

							menu
									.addItem((item) => {
										item
												.setTitle("Open as kanban board")
												.setIcon(EDITABLE_MARKDOWN_ICON)
												.onClick(() => {
													self.mindmapFileModes[
													this.leaf.id || file.path
															] = MINDMAP_VIEW_TYPE;
													self.setEditableMindmapView(this.leaf);
												});
									})
									.addSeparator();

							next.call(this, menu);
						};
					},
				})
		);

		this.registerView(MINDMAP_VIEW_TYPE, (leaf) => new EditableMindmapView(leaf, this));

		this.addCommand({
			id: "create-new-editable-mindmap",
			name: "Create new ediable-mindmap",
			callback: () => this.newEditableMindmap(),
		});
	}

	async setMarkdownView(leaf: WorkspaceLeaf) {
		await leaf.setViewState({
			type: "markdown",
			state: leaf.view.getState(),
		});
	}

	async setEditableMindmapView(leaf: WorkspaceLeaf) {
		await leaf.setViewState({
			type: "markdown",
			state: leaf.view.getState(),
		});
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private newEditableMindmap() {
		throw new Error("TBI")
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
