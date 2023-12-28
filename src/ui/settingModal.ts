import {
	Modal,
	Setting,
	PluginSettingTab,
	ButtonComponent, App
} from 'obsidian';

import { i18nConfig } from "../lang/I18n";
import ObsidianSyncNotionPlugin from "../main";
import {DatabaseDetails, ObsidianSettingTab} from "./settingTabs";
import {SettingNextTabs} from "./settingNextTabs";
import {SettingGeneralTabs} from "./settingGeneralTabs";


export class SettingModal extends Modal {
	data: Record<string, any> = {
		databaseFormat: 'none',
		databaseFullName: '',
		databaseAbbreviateName: '',
		notionAPI: '',
		databaseID: '',
		tagButton: true,
		customTitleButton: false,
		customTitleName: '',
		// customValues: '',
		saved: false,
	};
	plugin: ObsidianSyncNotionPlugin;
	settingTab: ObsidianSettingTab;

	constructor(app: App, plugin: ObsidianSyncNotionPlugin, settingTab: ObsidianSettingTab, dbDetails?: DatabaseDetails) {
		super(app);
		this.plugin = plugin;
		this.settingTab = settingTab;
		if (dbDetails) {
			this.data.databaseFormat = dbDetails.format;
			this.data.databaseFullName = dbDetails.fullName;
			this.data.databaseAbbreviateName = dbDetails.abName;
			this.data.notionAPI = dbDetails.notionAPI;
			this.data.databaseID = dbDetails.databaseID;
			this.data.tagButton = dbDetails.tagButton;
			this.data.customTitleButton = dbDetails.customTitleButton;
			this.data.customTitleName = dbDetails.customTitleName;
			// this.data.customValues = dbDetails.customValues;
		}

	}

	display(): void {
		this.containerEl.addClass("settings-modal");
		this.titleEl.setText('Add new database');

		// create the dropdown button to select the database format
		let { contentEl } = this;
		contentEl.empty();

		const settingDiv = contentEl.createDiv('setting-div');
		const nextTabs = contentEl.createDiv('next-tabs');


		new Setting(settingDiv)
			.setName(i18nConfig.databaseFormat)
			.setDesc(i18nConfig.databaseFormatDesc)
			.addDropdown((component) => {
				component
					.addOption('none', '')
					.addOption('general', i18nConfig.databaseGeneral)
					.addOption('next', i18nConfig.databaseNext)
					.addOption('custom', i18nConfig.databaseCustom)
					.setValue(this.data.databaseFormat)
					.onChange(async (value) => {
						this.data.databaseFormat = value;
						nextTabs.empty();
						this.updateContentBasedOnSelection(value, nextTabs);
					});

				// Initialize content based on the current dropdown value
				this.updateContentBasedOnSelection(this.plugin.settings.databaseFormat, nextTabs);
			});

		// add save button

		let footerEl = contentEl.createDiv('save-button');
		let saveButton = new Setting(footerEl)
		saveButton.addButton((button: ButtonComponent) => {
			return button
				.setTooltip('Save')
				.setIcon('checkmark')
				.onClick(async () => {
					this.data.saved = true;
					this.close();
				});
		}
		);
		saveButton.addExtraButton((button) => {
			return button
				.setTooltip('Cancel')
				.setIcon('cross')
				.onClick(() => {
					this.data.saved = false;
					this.close();
				});
		}
		);
	}

	updateContentBasedOnSelection(value: string, nextTabs: HTMLElement): void {
		// Clear existing content
		nextTabs.empty();

		// Generate content based on the selected value
		if (value === 'general') {
			nextTabs.createEl('h3', { text: i18nConfig.NotionGeneralSettingHeader });

			// add full name
			this.createSettingEl(nextTabs, i18nConfig.databaseFullName, i18nConfig.databaseFullNameDesc, 'text', i18nConfig.databaseFullNameText, this.data.databaseFullName, 'databaseFullName')

			// add abbreviate name
			this.createSettingEl(nextTabs, i18nConfig.databaseAbbreviateName, i18nConfig.databaseAbbreviateNameDesc, 'text', i18nConfig.databaseAbbreviateNameText, this.data.databaseAbbreviateName, 'databaseAbbreviateName')

			// tag button
			this.createSettingEl(nextTabs, i18nConfig.NotionTagButton, i18nConfig.NotionTagButtonDesc, 'toggle', i18nConfig.NotionCustomTitleText, this.data.tagButton, 'tagButton')


			// add api key
			this.createSettingEl(nextTabs, i18nConfig.NotionAPI, i18nConfig.NotionAPIDesc, 'password', i18nConfig.NotionAPIText, this.data.notionAPI, 'notionAPI')

			// add database id
			this.createSettingEl(nextTabs, i18nConfig.DatabaseID, i18nConfig.NotionAPIDesc, 'password', i18nConfig.DatabaseIDText, this.data.databaseID, 'databaseID')


		} else if (value === 'next') {

			nextTabs.createEl('h3', { text: i18nConfig.NotionNextSettingHeader });

			// add full name
			this.createSettingEl(nextTabs, i18nConfig.databaseFullName, i18nConfig.databaseFullNameDesc, 'text', i18nConfig.databaseFullNameText, this.data.databaseFullName, 'databaseFullName')

			// add abbreviate name
			this.createSettingEl(nextTabs, i18nConfig.databaseAbbreviateName, i18nConfig.databaseAbbreviateNameDesc, 'text', i18nConfig.databaseAbbreviateNameText, this.data.databaseAbbreviateName, 'databaseAbbreviateName')

			// add api key
			this.createSettingEl(nextTabs, i18nConfig.NotionAPI, i18nConfig.NotionAPIDesc, 'password', i18nConfig.NotionAPIText, this.data.notionAPI, 'notionAPI')


			// add database id
			this.createSettingEl(nextTabs, i18nConfig.DatabaseID, i18nConfig.NotionAPIDesc, 'password', i18nConfig.DatabaseIDText, this.data.databaseID, 'databaseID')

		} else if (value === 'custom') {
			nextTabs.createEl('h3', { text: i18nConfig.NotionCustomSettingHeader});

			// add full name
			this.createSettingEl(nextTabs, i18nConfig.databaseFullName, i18nConfig.databaseFullNameDesc, 'text', i18nConfig.databaseFullNameText, this.data.databaseFullName, 'databaseFullName')

			// add abbreviate name
			this.createSettingEl(nextTabs, i18nConfig.databaseAbbreviateName, i18nConfig.databaseAbbreviateNameDesc, 'text', i18nConfig.databaseAbbreviateNameText, this.data.databaseAbbreviateName, 'databaseAbbreviateName')

			// tag button
			this.createSettingEl(nextTabs, i18nConfig.NotionTagButton, i18nConfig.NotionTagButtonDesc, 'toggle', i18nConfig.NotionCustomTitleText, this.data.tagButton, 'tagButton')

			// add custom title button

			new Setting(nextTabs)
				.setName(i18nConfig.NotionCustomTitle)
				.setDesc(i18nConfig.NotionCustomTitleDesc)
				.addToggle((toggle) =>
					toggle
						.setValue(this.data.CustomTitleButton)
						.onChange(async (value) => {
							this.data.CustomTitleButton = value;

							this.updateSettingEl(CustomNameEl, value)

							// this.updateSettingEl(CustomValuesEl, value)

							await this.plugin.saveSettings();
							await this.plugin.commands.updateCommand();
						})
				);


			// add custom title name
			const CustomNameEl = this.createStyleDiv('custom-name', (this.data.CustomTitleButton), nextTabs);
			this.createSettingEl(CustomNameEl, i18nConfig.NotionCustomTitleName, i18nConfig.NotionCustomTitleNameDesc, 'text', i18nConfig.NotionCustomTitleText, this.data.CustomTitleName, 'CustomTitleName')

			// // add custom values
			// const CustomValuesEl = this.createStyleDiv('custom-values', (this.data.CustomTitleButton), nextTabs);
			// new Setting(CustomValuesEl)
			// 	.setName(i18nConfig.NotionCustomValues)
			// 	.setDesc(i18nConfig.NotionCustomValuesDesc)
			// 	.addTextArea((text) => {
			// 		return text
			// 			.setPlaceholder(i18nConfig.NotionCustomValuesText)
			// 			.setValue(this.data.CustomValues)
			// 			.onChange(async (value) => {
			// 				this.data.CustomValues = value;
			// 				await this.plugin.saveSettings();
			// 			});
			// 	});


			// add api key
			const notionAPIGeneralEl = this.createStyleDiv('api-general', this.plugin.settings.GeneralButton, nextTabs);
			this.createSettingEl(notionAPIGeneralEl, i18nConfig.NotionAPI, i18nConfig.NotionAPIDesc, 'password', i18nConfig.NotionAPIText, this.data.notionAPI, 'notionAPI')

			// add database id
			const databaseIDGeneralEl = this.createStyleDiv('databaseID-general', this.plugin.settings.GeneralButton, nextTabs);
			this.createSettingEl(databaseIDGeneralEl, i18nConfig.DatabaseID, i18nConfig.NotionAPIDesc, 'password', i18nConfig.DatabaseIDText, this.data.databaseID, 'databaseID')
		}

	}



	onOpen() {
		// add console log to check if the modal is opened
		this.display()
	}



	// create a function to create a div with a style for pop over elements
	public createStyleDiv(className: string, commandValue: boolean = false,parentEl: HTMLElement ) {
		return parentEl.createDiv(className, (div) => {
			this.updateSettingEl(div, commandValue);
		});
	}
	// update the setting display style in the setting tab
	public updateSettingEl(element: HTMLElement, commandValue: boolean) {
		element.style.borderTop = commandValue ? "1px solid var(--background-modifier-border)" : "none";
		element.style.paddingTop = commandValue ? "0.75em" : "0";
		element.style.display = commandValue ? "block" : "none";
		element.style.alignItems = "center";
	}

	// function to add one setting element in the setting tab.
	public createSettingEl(contentEl: HTMLElement, name: string, desc: string, type: string, placeholder: string, holderValue: any,settingsKey: string) {
		if (type === 'password') {
			return new Setting(contentEl)
				.setName(name)
				.setDesc(desc)
				.addText((text) => {
					text.inputEl.type = type;
					return text
						.setPlaceholder(placeholder)
						.setValue(holderValue)
						.onChange(async (value) => {
							this.data[settingsKey] = value; // Update the settings dictionary							await this.plugin.saveSettings();
						})
				});
		} else if (type === 'toggle') {
			return new Setting(contentEl)
				.setName(name)
				.setDesc(desc)
				.addToggle((toggle) =>
					toggle
						.setValue(holderValue)
						.onChange(async (value) => {
							this.data[settingsKey] = value; // Update the settings dictionary							await this.plugin.saveSettings();
						})
				);
		} else if (type === 'text') {
			return new Setting(contentEl)
				.setName(name)
				.setDesc(desc)
				.addText((text) =>
					text
						.setPlaceholder(placeholder)
						.setValue(holderValue)
						.onChange(async (value) => {
							this.data[settingsKey] = value; // Update the settings dictionary							await this.plugin.saveSettings();
						})
				);
		}
	}
}
