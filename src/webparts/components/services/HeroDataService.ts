import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { IHeroItem } from "../models/IHeroItem";

export enum FieldTypeKind {
  SingleLineOfText = 2,
  MultipleLinesOfText = 3,
  DateTime = 4,
  Choice = 6,
  Lookup = 7,
  YesNo = 8,
  Number = 9,
  Currency = 10,
  HyperlinkOrPicture = 11,
  MultiChoice = 15,
  Calculated = 17,
  PersonOrGroup = 20,
}

export interface IListOption {
  key: string;
  text: string;
}

export interface IHeroListValidationResult {
  isValid: boolean;
  missingFields: string[];
}

export interface ICreatedListResult {
  listId: string;
  listTitle: string;
}

interface IHeroFieldDefinition {
  title: string;
  fieldTypeKind: number;
  properties?: { [key: string]: string | number | boolean };
}

export class HeroDataService {
  private static readonly listName: string = "HeroContent";
  private static readonly requiredFields: string[] = [
    "Title",
    "TitleAR",
    "DescriptionEN",
    "DescriptionAR",
    "ImageUrl",
    "ImageUrlAR",
    "LinkUrl",
    "LinkTextEN",
    "LinkTextAR",
    "DisplayOrder",
    "IsActive",
    "OpenInNewTab",
  ];
  private static readonly verboseHeaders: { [key: string]: string } = {
    Accept: "application/json;odata=verbose",
    "Content-Type": "application/json;odata=verbose",
    "OData-Version": "3.0",
  };

  private static readonly heroFieldDefinitions: IHeroFieldDefinition[] = [
    { title: "TitleAR", fieldTypeKind: 2 },
    {
      title: "DescriptionEN",
      fieldTypeKind: FieldTypeKind.MultipleLinesOfText,
      //   properties: { RichTextMode: "Compatible" },
    },
    {
      title: "DescriptionAR",
      fieldTypeKind: FieldTypeKind.MultipleLinesOfText,
      //   properties: { RichTextMode: "Compatible" },
    },
    {
      title: "ImageUrl",
      fieldTypeKind: FieldTypeKind.HyperlinkOrPicture,
      //   properties: { DisplayFormat: 0 },
    },
    {
      title: "ImageUrlAR",
      fieldTypeKind: FieldTypeKind.HyperlinkOrPicture,
      //   properties: { DisplayFormat: 0 },
    },
    {
      title: "LinkUrl",
      fieldTypeKind: FieldTypeKind.HyperlinkOrPicture,
      //   properties: { DisplayFormat: 0 },
    },
    { title: "LinkTextEN", fieldTypeKind: FieldTypeKind.SingleLineOfText },
    { title: "LinkTextAR", fieldTypeKind: FieldTypeKind.SingleLineOfText },
    {
      title: "DisplayOrder",
      fieldTypeKind: FieldTypeKind.Number,
      //   properties: { Minimum: 0, Maximum: 100000 },
    },
    {
      title: "IsActive",
      fieldTypeKind: FieldTypeKind.YesNo,
      //   properties: { DefaultValue: "1" },
    },
    { title: "OpenInNewTab", fieldTypeKind: FieldTypeKind.YesNo },
  ];

  constructor(
    private webAbsoluteUrl: string,
    private spHttpClient: SPHttpClient,
    private currentCultureName?: string,
  ) {}

  public getAvailableLists(): Promise<IListOption[]> {
    const url =
      this.webAbsoluteUrl +
      "/_api/web/lists?$select=Id,Title&$filter=Hidden eq false";

    return this.spHttpClient
      .get(url, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => response.json())
      .then((json: any) => {
        return (json.value || []).map((list: any) => {
          return {
            key: list.Id,
            text: list.Title,
          };
        });
      });
  }

  public validateList(listId: string): Promise<IHeroListValidationResult> {
    const url =
      this.webAbsoluteUrl +
      "/_api/web/lists(guid'" +
      listId +
      "')/fields?$select=Title,InternalName";

    return this.spHttpClient
      .get(url, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => response.json())
      .then((json: any) => {
        const fieldNames = (json.value || []).map(
          (field: any) => field.InternalName || field.Title,
        );
        const missingFields = HeroDataService.requiredFields.filter(
          (fieldName: string) => {
            return fieldNames.indexOf(fieldName) === -1;
          },
        );

        return {
          isValid: missingFields.length === 0,
          missingFields: missingFields,
        };
      });
  }

  public createHeroListIfNeeded(): Promise<ICreatedListResult> {
    return this.getAvailableLists().then((lists: IListOption[]) => {
      const existingList = lists.filter(
        (list) =>
          list.text.toLowerCase() === HeroDataService.listName.toLowerCase(),
      )[0];

      if (existingList) {
        return this.ensureHeroFields(existingList.key).then(() => ({
          listId: existingList.key,
          listTitle: existingList.text,
        }));
      }

      return this.createList(HeroDataService.listName).then(
        (createdList: any) => {
          const listId =
            createdList.Id ||
            createdList.ListId ||
            (createdList.d && createdList.d.Id);
          return this.ensureHeroFields(listId).then(() => ({
            listId: listId,
            listTitle: HeroDataService.listName,
          }));
        },
      );
    });
  }

  public getHeroItems(listId: string): Promise<IHeroItem[]> {
    const url =
      this.webAbsoluteUrl +
      "/_api/web/lists(guid'" +
      listId +
      "')/items?$select=Id,Title,TitleAR,DescriptionEN,DescriptionAR,ImageUrl,ImageUrlAR,LinkUrl,LinkTextEN,LinkTextAR,DisplayOrder,IsActive,OpenInNewTab&$orderby=DisplayOrder asc";

    return this.spHttpClient
      .get(url, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => response.json())
      .then((json: any) => {
        const items = (json.value || [])
          .filter(
            (item: any) => item.IsActive === true || item.IsActive === "true",
          )
          .map((item: any) => this.mapListItem(item))
          .sort(
            (a: IHeroItem, b: IHeroItem) => a.displayOrder - b.displayOrder,
          );

        return items;
      });
  }

  //   private createList(title: string): Promise<any> {
  //     const url = this.webAbsoluteUrl + "/_api/web/lists";
  //     const postBody = {
  //       __metadata: {
  //         type: "SP.List",
  //       },
  //       BaseTemplate: 100,
  //       Title: title,
  //       Description: "Hero content list for DynamicHeroWebPart",
  //       EnableVersioning: true,
  //       ContentTypesEnabled: false,
  //     };

  //     return this.spHttpClient
  //       .post(url, SPHttpClient.configurations.v1, {
  //         headers: {
  //           Accept: "application/json;odata=verbose",
  //           "Content-type": "application/json;odata=verbose",
  //           "odata-version": "",
  //         },
  //         body: JSON.stringify(postBody),
  //       })
  //       .then((response: SPHttpClientResponse) => {
  //         if (response.ok) {
  //           const result = response.json();
  //           const listId: string = result.d.Id;
  //           console.log("List created successfully");
  //         }
  //       });
  //   }

  public async createList(title: string): Promise<any> {
    const url = `${this.webAbsoluteUrl}/_api/web/lists`;

    const postBody = {
      __metadata: {
        type: "SP.List",
      },
      BaseTemplate: 100,
      Title: title,
      Description: "Hero content list for DynamicHeroWebPart",
      EnableVersioning: true,
      ContentTypesEnabled: false,
    };

    const response = await this.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: HeroDataService.verboseHeaders,
        body: JSON.stringify(postBody),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create list: ${error}`);
    }
    console.log("List created successfully");
    const result = await response.json();
    const listId: string = result.d.Id;
    if (listId) this.ensureHeroFields(listId);
  }

  private ensureHeroFields(listId: string): Promise<void> {
    return this.validateList(listId).then((validationResult) => {
      const missingDefinitions = HeroDataService.heroFieldDefinitions.filter(
        (field) => validationResult.missingFields.indexOf(field.title) !== -1,
      );

      let operation: Promise<void> = Promise.resolve();

      missingDefinitions.forEach((field) => {
        operation = operation.then(() => this.createField(listId, field));
      });

      return operation;
    });
  }

  //   private ensureHeroFields(listId: string): Promise<void> {
  //     const fieldOperations: Array<Promise<any>> = [];

  //     const fieldDefinitions = [
  //       {
  //         title: "TitleAR",
  //         type: "SP.FieldText",
  //         internalType: "Text",
  //         required: false,
  //       },
  //       {
  //         title: "DescriptionEN",
  //         type: "SP.FieldMultiLineText",
  //         internalType: "Note",
  //         required: false,
  //       },
  //       {
  //         title: "DescriptionAR",
  //         type: "SP.FieldMultiLineText",
  //         internalType: "Note",
  //         required: false,
  //       },
  //       {
  //         title: "ImageUrl",
  //         type: "SP.FieldUrl",
  //         internalType: "URL",
  //         required: false,
  //       },
  //       {
  //         title: "ImageUrlAR",
  //         type: "SP.FieldUrl",
  //         internalType: "URL",
  //         required: false,
  //       },
  //       {
  //         title: "LinkUrl",
  //         type: "SP.FieldUrl",
  //         internalType: "URL",
  //         required: false,
  //       },
  //       {
  //         title: "LinkTextEN",
  //         type: "SP.FieldText",
  //         internalType: "Text",
  //         required: false,
  //       },
  //       {
  //         title: "LinkTextAR",
  //         type: "SP.FieldText",
  //         internalType: "Text",
  //         required: false,
  //       },
  //       {
  //         title: "DisplayOrder",
  //         type: "SP.FieldNumber",
  //         internalType: "Number",
  //         required: false,
  //       },
  //       {
  //         title: "IsActive",
  //         type: "SP.FieldBoolean",
  //         internalType: "Boolean",
  //         required: false,
  //       },
  //       {
  //         title: "OpenInNewTab",
  //         type: "SP.FieldBoolean",
  //         internalType: "Boolean",
  //         required: false,
  //       },
  //     ];

  //     fieldDefinitions.forEach((field) => {
  //       fieldOperations.push(this.createField(listId, field));
  //     });

  //     return Promise.all(fieldOperations).then(() => undefined);
  //   }

  //   private createField(listId: string, fieldDefinition: any): Promise<any> {
  //     const url =
  //       this.webAbsoluteUrl + "/_api/web/lists(guid'" + listId + "')/fields";
  //     const postBody: any = {
  //       __metadata: {
  //         type: fieldDefinition.type,
  //       },
  //       Title: fieldDefinition.title,
  //       Required: fieldDefinition.required,
  //     };

  //     if (fieldDefinition.type === "SP.FieldNumber") {
  //       postBody["Minimum"] = 0;
  //       postBody["Maximum"] = 100000;
  //     }

  //     if (fieldDefinition.type === "SP.FieldMultiLineText") {
  //       postBody["RichText"] = false;
  //       postBody["RichTextMode"] = "Compatible";
  //     }

  //     if (fieldDefinition.type === "SP.FieldUrl") {
  //       postBody["DisplayFormat"] = 0;
  //     }

  //     return this.spHttpClient
  //       .post(url, SPHttpClient.configurations.v1, {
  //         headers: {
  //           Accept: "application/json;odata=verbose",
  //           "Content-type": "application/json;odata=verbose",
  //         },
  //         body: JSON.stringify(postBody),
  //       })
  //       .then((response: SPHttpClientResponse) => response.json())
  //       .catch(() => undefined);
  //   }

  private createField(
    listId: string,
    fieldDefinition: IHeroFieldDefinition,
  ): Promise<void> {
    const url =
      this.webAbsoluteUrl + "/_api/web/lists(guid'" + listId + "')/fields";

    const postBody: any = {
      __metadata: { type: "SP.Field" },
      Title: fieldDefinition.title,
      FieldTypeKind: fieldDefinition.fieldTypeKind,
      Required: false,
    };

    if (fieldDefinition.properties) {
      Object.keys(fieldDefinition.properties).forEach((propertyName) => {
        postBody[propertyName] = fieldDefinition.properties![propertyName];
      });
    }

    return this.spHttpClient
      .post(url, SPHttpClient.configurations.v1, {
        headers: HeroDataService.verboseHeaders,
        body: JSON.stringify(postBody),
      })
      .then((response: SPHttpClientResponse) => {
        if (!response.ok) {
          throw new Error(
            "Unable to create field '" +
              fieldDefinition.title +
              "'. HTTP " +
              response.status,
          );
        }

        return response.json();
      })
      .then(() => undefined);
  }

  private getUrlValue(value: any): string {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    return value.Url || "";
  }

  private mapListItem(item: any): IHeroItem {
    const isArabic =
      this.currentCultureName &&
      this.currentCultureName.toLowerCase().indexOf("ar") === 0;

    const title = isArabic
      ? item.TitleAR || item.Title || ""
      : item.Title || item.TitleAR || "";
    const description = isArabic
      ? item.DescriptionAR || item.DescriptionEN || item.Description || ""
      : item.DescriptionEN || item.DescriptionAR || item.Description || "";
    const linkText = isArabic
      ? item.LinkTextAR || item.LinkTextEN || item.LinkText || ""
      : item.LinkTextEN || item.LinkTextAR || item.LinkText || "";

    const imageUrl = isArabic
      ? this.getUrlValue(item.ImageUrlAR) || this.getUrlValue(item.ImageUrl)
      : this.getUrlValue(item.ImageUrl) || this.getUrlValue(item.ImageUrlAR);

    return {
      id: item.Id,
      title: title,
      description: description,
      imageUrl: imageUrl,
      linkUrl: this.getUrlValue(item.LinkUrl),
      linkText: linkText,
      displayOrder: item.DisplayOrder || 0,
      isActive: item.IsActive === true || item.IsActive === "true",
      openInNewTab: item.OpenInNewTab === true || item.OpenInNewTab === "true",
      titleAr: item.TitleAR,
      descriptionAr: item.DescriptionAR,
      linkTextAr: item.LinkTextAR,
      imageUrlAr: this.getUrlValue(item.ImageUrlAR),
    };
  }
}
