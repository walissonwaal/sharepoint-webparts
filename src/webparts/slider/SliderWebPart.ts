import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import styles from "./SliderWebPart.module.scss";
import * as strings from "SliderWebPartStrings";

import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export interface SPList {
  value: SPLIstItem[];
}

export interface SPLIstItem {
  Title: string;
  Image: string;
  Description: string;
  Path: SPPathUrl;
}

export interface SPPathUrl {
  Url: string;
}

// import function to register Swiper custom elements
import { register } from "swiper/element/bundle";
// register Swiper custom elements
register();

export interface ISliderWebPartProps {
  description: string;
}

export default class SliderWebPart extends BaseClientSideWebPart<ISliderWebPartProps> {
  private _getListData(): Promise<SPList> {
    return this.context.spHttpClient
      .get(
        this.context.pageContext.web.absoluteUrl +
          "/_api/web/lists/GetByTitle('Destaques')/Items",
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
        const imageJSON = JSON.parse(item.Image);

        html += `
          <swiper-slide lazy="true" class="${styles.swiperSlide}">
            <a href="${item.Path.Url}" target="_blank">
              <img src="${imageJSON.serverRelativeUrl}" alt="${item.Title}" loading="lazy" />
            </a> 
            <div class="${styles.slideTextContainer}">
              <h2 class="${styles.slideTitle}">${item.Title}</h2>
              <p class="${styles.slideDescription}">${item.Description}</p>
            </div>
          </swiper-slide>
        `;
      });

      const cardsContainer: Element | null =
        this.domElement.querySelector("#spSwiperContainer");

      if (cardsContainer) {
        cardsContainer.innerHTML = html;
      } else {
        console.error("O contêiner de cartões não foi encontrado.");
      }
    });
  }

  public render(): void {
    this.domElement.innerHTML = `
    <section class="${styles.slider}">
      <swiper-container id="spSwiperContainer" class="${styles.swiperContainer} mySlider" pagination="true" pagination-clickable="true" navigation="true" space-between="30"
      centered-slides="true" autoplay-delay="2500" autoplay-disable-on-interaction="false">
    
      </swiper-container>
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
