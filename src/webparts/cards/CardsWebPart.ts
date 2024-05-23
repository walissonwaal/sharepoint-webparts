import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import type { IReadonlyTheme } from "@microsoft/sp-component-base";
// import { escape } from "@microsoft/sp-lodash-subset";

import styles from "./CardsWebPart.module.scss";
import * as strings from "CardsWebPartStrings";

export interface ICardsWebPartProps {
  description: string;
}

// Fetch list

import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export interface SPList {
  value: SPLIstItem[];
}

export interface SPLIstItem {
  Title: string;
  Description: string;
  BackgroundImage: string;
  Icon: string;
  Path: SPPathUrl;
}

export interface SPPathUrl {
  Url: string;
}

// End fetch list

export default class CardsWebPart extends BaseClientSideWebPart<ICardsWebPartProps> {
  private _getListData(): Promise<SPList> {
    return this.context.spHttpClient
      .get(
        this.context.pageContext.web.absoluteUrl +
          "/_api/web/lists/GetByTitle('Equipes')/Items",
        SPHttpClient.configurations.v1
      )
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _renderList(): void {
    this._getListData().then((response) => {
      let html: string = "";
      response.value.forEach((item: SPLIstItem) => {
        // const iconJSON = JSON.parse(item.Icon);
        const backgroundImageJSON = JSON.parse(item.BackgroundImage);
        const iconJSON = JSON.parse(item.Icon);

        html += `
        <a class="${styles.cardUrl} "href="${
          !item.Path.Url ? "#" : item.Path.Url
        }">
          <div class="${styles.card}">
            <div class="${styles.imagesContainer}">
              <img class="${styles.backgroundImage}" src="${
          backgroundImageJSON.serverRelativeUrl
        }" alt="${backgroundImageJSON.fileName}" />
              <img class="${styles.icon}" src="${
          iconJSON.serverRelativeUrl
        }" alt="${iconJSON.fileName}" />
            </div>
            <div class="${styles.cardBody}">
              <h2 class="${styles.title}">${item.Title}</h2>
              <p class="${styles.description}">${item.Description}</p>
            </div>
          </div>
        </a>
        `;
      });

      const cardsContainer: Element | null =
        this.domElement.querySelector("#spCardsContainer");

      if (cardsContainer) {
        cardsContainer.innerHTML = html;
      } else {
        console.error("O contêiner de cartões não foi encontrado.");
      }
    });
  }

  public render(): void {
    this.domElement.innerHTML = `
    <section class="${styles.sectionCards}">
      <div class="${styles.cardsContainer}" id="spCardsContainer"></div>
    </section>`;
    this._renderList();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null
      );
    }
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
