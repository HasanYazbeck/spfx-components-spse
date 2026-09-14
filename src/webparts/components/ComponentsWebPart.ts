import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  IPropertyPaneDropdownOption,
} from "@microsoft/sp-webpart-base";

import * as strings from "ComponentsWebPartStrings";
import HeroComponents from "./components/Components";
import { IComponentsProps } from "./components/IComponentsProps";
import { IHeroWebPartProps } from "./models/IHeroWebPartProps";

export default class ComponentsWebPart extends BaseClientSideWebPart<IHeroWebPartProps> {
  public render(): void {
    const props: IComponentsProps = {
      spHttpClient: this.context.spHttpClient,
      pageContext: this.context.pageContext,
      properties: this.properties,
      strings: strings,
      onSourceUpdated: this.onSourceUpdated,
    };

    const element = React.createElement(
      HeroComponents as React.ComponentType<IComponentsProps>,
      props,
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  // protected readonly dataVersion: Version = Version.parse("1.0");

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const layoutOptions: IPropertyPaneDropdownOption[] = [
      { key: "full-width", text: strings.LayoutFullWidth },
      { key: "feature", text: strings.LayoutFeature },
      { key: "carousel", text: strings.LayoutCarousel },
    ];

    const textAlignOptions: IPropertyPaneDropdownOption[] = [
      { key: "left", text: strings.TextAlignLeft },
      { key: "center", text: strings.TextAlignCenter },
      { key: "right", text: strings.TextAlignRight },
    ];

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.GeneralGroupName,
              groupFields: [
                PropertyPaneDropdown("heroLayout", {
                  label: strings.HeroLayoutLabel,
                  options: layoutOptions,
                }),
                PropertyPaneTextField("maxItems", {
                  label: strings.MaxItemsLabel,
                  description: strings.MaxItemsDescription,
                  value: this.properties.maxItems
                    ? this.properties.maxItems.toString()
                    : "5",
                }),
                PropertyPaneCheckbox("autoRotate", {
                  text: strings.AutoRotateLabel,
                  checked: !!this.properties.autoRotate,
                }),
                PropertyPaneTextField("rotationInterval", {
                  label: strings.RotationIntervalLabel,
                  description: strings.RotationIntervalDescription,
                  value: this.properties.rotationInterval
                    ? this.properties.rotationInterval.toString()
                    : "5",
                }),
                PropertyPaneCheckbox("showNavigation", {
                  text: strings.ShowNavigationLabel,
                  checked: this.properties.showNavigation !== false,
                }),
                PropertyPaneCheckbox("showPagination", {
                  text: strings.ShowPaginationLabel,
                  checked: this.properties.showPagination !== false,
                }),
                PropertyPaneTextField("heroHeight", {
                  label: strings.HeroHeightLabel,
                  description: strings.HeroHeightDescription,
                  value: this.properties.heroHeight
                    ? this.properties.heroHeight.toString()
                    : "420",
                }),
                PropertyPaneDropdown("textAlign", {
                  label: strings.TextAlignLabel,
                  options: textAlignOptions,
                }),
                PropertyPaneTextField("overlayStrength", {
                  label: strings.OverlayStrengthLabel,
                  description: strings.OverlayStrengthDescription,
                  value: this.properties.overlayStrength
                    ? this.properties.overlayStrength.toString()
                    : "50",
                }),
                PropertyPaneCheckbox("openLinksInNewWindow", {
                  text: strings.OpenLinksInNewWindowLabel,
                  checked: !!this.properties.openLinksInNewWindow,
                }),
                PropertyPaneTextField("fallbackImageUrl", {
                  label: strings.FallbackImageUrlLabel,
                  description: strings.FallbackImageDescription,
                  value: this.properties.fallbackImageUrl || "",
                }),
              ],
            },
          ],
        },
      ],
    };
  }

  private onSourceUpdated = (listId: string, listTitle: string): void => {
    this.properties.dataSourceListId = listId;
    this.properties.dataSourceListTitle = listTitle;
    this.render();
  };
}
