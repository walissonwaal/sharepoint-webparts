import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import styles from "./CardsCanaisDeComunicacaoWebPart.module.scss";
import * as strings from "CardsCanaisDeComunicacaoWebPartStrings";

import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export interface SPList {
  value: SPLIstItem[];
}

export interface SPLIstItem {
  Title: string;
  BackgroundImage: string;
  Icon: string;
  Path: SPPathUrl;
}

export interface SPPathUrl {
  Url: string;
}

export interface ICardsCanaisDeComunicacaoWebPartProps {
  description: string;
}

export default class CardsCanaisDeComunicacaoWebPart extends BaseClientSideWebPart<ICardsCanaisDeComunicacaoWebPartProps> {
  private _getListData(): Promise<SPList> {
    return this.context.spHttpClient
      .get(
        this.context.pageContext.web.absoluteUrl +
          "/_api/web/lists/GetByTitle('CanaisDeComunicacao')/Items",
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
            </div>
          </div>
        </a>
        `;
      });

      const cardsCanaisDeComunicacaoContainer: Element | null =
        this.domElement.querySelector("#spCardsCanaisDeComunicacaoContainer");

      if (cardsCanaisDeComunicacaoContainer) {
        cardsCanaisDeComunicacaoContainer.innerHTML = html;
      } else {
        console.error("O contêiner de cartões não foi encontrado.");
      }
    });
  }

  public render(): void {
    this.domElement.innerHTML = `
    <section class="${styles.cardsCanaisDeComunicacao}">
      <div class="${styles.cardsCanaisDeComunicacaoContainer}" id="spCardsCanaisDeComunicacaoContainer"></div>
    </section>`;
    this._renderList();
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
