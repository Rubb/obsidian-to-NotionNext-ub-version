import {App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting} from "obsidian";
import {addIcons} from 'src/icon';
import {Upload2Notion} from "src/Upload2Notion";
import {Upload2NotionNext} from "src/Upload2Notion_NN";
import {NoticeMConfig} from "src/Message";
import {I18nConfig} from "src/I18n";

// Remember to rename these classes and interfaces!

interface PluginSettings {
    NNon: boolean;
    notionAPI: string;
    databaseID: string;
    bannerUrl: string;
    notionID: string;
    proxy: string;
}

const langConfig = NoticeMConfig(window.localStorage.getItem('language') || 'en')

const i18nConfig = I18nConfig(window.localStorage.getItem('language') || 'en')

const DEFAULT_SETTINGS: PluginSettings = {
    NNon: undefined,
    notionAPI: "",
    databaseID: "",
    bannerUrl: "",
    notionID: "",
    proxy: "",
};

export default class ObsidianSyncNotionPlugin extends Plugin {
    settings: PluginSettings;

    async onload() {
        await this.loadSettings();
        addIcons();
        // This creates an icon in the left ribbon.
        const ribbonIconEl = this.addRibbonIcon(
            "notion-logo",
            i18nConfig.ribbonIcon,
            async (evt: MouseEvent) => {
                // Called when the user clicks the icon.
                await this.upload();
            }
        );

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        // statusBarItemEl.setText("share to notion");

        this.addCommand({
            id: "share-to-notionnext",
            name: i18nConfig.CommandName,
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                await this.upload()
            },
        });


        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new ObsidianSettingTab(this.app, this));

    }

    onunload() {
    }

    async upload() {
        const { notionAPI, databaseID, NNon} = this.settings;

		// Check if NNon exists
		if (NNon === undefined) {
			const NNonmessage = langConfig.NNonMissing;
			new Notice(NNonmessage);
			return;
		}

		// Check if the user has set up the Notion API and database ID
        if (notionAPI === "" || databaseID === "") {
			const setAPIMessage = langConfig["set-api-id"];
            new Notice(setAPIMessage);
            return;
        }

        const {markDownData, nowFile, emoji, cover, tags, type, slug, stats, category, summary, paword, favicon, datetime} = await this.getNowFileMarkdownContent(this.app);


        if (markDownData) {
            const { basename } = nowFile;
            let upload;

            if (NNon) {
                upload = new Upload2NotionNext(this);
            } else {
                upload = new Upload2Notion(this);
            }

            const res = await upload.syncMarkdownToNotion(basename, emoji, cover, tags, type, slug, stats, category, summary, paword, favicon, datetime, markDownData, nowFile, this.app, this.settings);

            if (res.status === 200) {
                new Notice(`${langConfig["sync-success"]}${basename}`);
            } else {
                new Notice(`${langConfig["sync-fail"]}${basename}`, 5000);
            }
        }
    }

    async getNowFileMarkdownContent(app: App) {
        const nowFile = app.workspace.getActiveFile();
        const {NNon} = this.settings;
        let emoji = ''
        let cover = ''
        let tags = []
        let type = ''
        let slug = ''
        let stats = ''
        let category = ''
        let summary = ''
        let paword = ''
        let favicon = ''
        let datetime = ''

        const FileCache = app.metadataCache.getFileCache(nowFile)
        try {
            if (NNon) {
                emoji = FileCache.frontmatter.titleicon;
                cover = FileCache.frontmatter.coverurl;
                tags = FileCache.frontmatter.tags;
                type = FileCache.frontmatter.type;
                slug = FileCache.frontmatter.slug;
                stats = FileCache.frontmatter.stats;
                category = FileCache.frontmatter.category;
                summary = FileCache.frontmatter.summary;
                paword = FileCache.frontmatter.password;
                favicon = FileCache.frontmatter.icon;
                datetime = FileCache.frontmatter.date;
            }
        } catch (error) {
            new Notice(langConfig["set-tags-fail"]);
        }
        if (nowFile) {
            const markDownData = await nowFile.vault.read(nowFile);
            return {
                markDownData,
                nowFile,
                emoji,
                cover,
                tags,
                type,
                slug,
                stats,
                category,
                summary,
                paword,
                favicon,
                datetime,
            };
        } else {
            new Notice(langConfig["open-file"]);
            return;
        }
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class ObsidianSettingTab extends PluginSettingTab {
    plugin: ObsidianSyncNotionPlugin;

    constructor(app: App, plugin: ObsidianSyncNotionPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName(i18nConfig.NotionNextVersion)
            .setDesc(i18nConfig.NotionNextVersionDesc)
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.NNon)
                    .onChange(async (value) => {
                        this.plugin.settings.NNon = value;
                        await this.plugin.saveSettings();
                    })
            );

        containerEl.createEl('h2', {text: i18nConfig.NotionNextSetting})

        new Setting(containerEl)
            .setName(i18nConfig.NotionAPI)
            .setDesc(i18nConfig.NotionAPIDesc)
            .addText((text) => {
                text.inputEl.type = 'password';
                return text
                    .setPlaceholder(i18nConfig.NotionAPIText)
                    .setValue(this.plugin.settings.notionAPI)
                    .onChange(async (value) => {
                        this.plugin.settings.notionAPI = value;
                        await this.plugin.saveSettings();
                    })
            });


        const notionDatabaseID = new Setting(containerEl)
            .setName(i18nConfig.NotionID)
            .setDesc(i18nConfig.NotionAPIDesc)
            .addText((text) => {
                    text.inputEl.type = 'password';
                    return text
                        .setPlaceholder(i18nConfig.NotionIDText)
                        .setValue(this.plugin.settings.databaseID)
                        .onChange(async (value) => {
                            this.plugin.settings.databaseID = value;
                            await this.plugin.saveSettings();
                        })
                }
            );

        // notionDatabaseID.controlEl.querySelector('input').type='password'

        new Setting(containerEl)
            .setName(i18nConfig.BannerUrl)
            .setDesc(i18nConfig.BannerUrlDesc)
            .addText((text) =>
                text
                    .setPlaceholder(i18nConfig.BannerUrlText)
                    .setValue(this.plugin.settings.bannerUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.bannerUrl = value;
                        await this.plugin.saveSettings();
                    })
            );


        new Setting(containerEl)
            .setName(i18nConfig.NotionUser)
            .setDesc(i18nConfig.NotionUserDesc)
            .addText((text) =>
                text
                    .setPlaceholder(i18nConfig.NotionUserText)
                    .setValue(this.plugin.settings.notionID)
                    .onChange(async (value) => {
                        this.plugin.settings.notionID = value;
                        await this.plugin.saveSettings();
                    })
            );

        // General Database Settings
        containerEl.createEl('h2', {text: i18nConfig.NotionGeneralSetting});

		new Setting(containerEl)
			.setName(i18nConfig.NotYetFinish)

        // new Setting(containerEl)
        // .setName("Convert tags(optional)")
        // .setDesc("Transfer the Obsidian tags to the Notion table. It requires the column with the name 'Tags'")
        // .addToggle((toggle) =>
        // 	toggle
        // 		.setValue(this.plugin.settings.allowTags)
        // 		.onChange(async (value) => {
        // 			this.plugin.settings.allowTags = value;
        // 			await this.plugin.saveSettings();
        // 		})
        // );
    }
}