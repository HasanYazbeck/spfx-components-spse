import { SPHttpClient } from "@microsoft/sp-http";
import { IHeroWebPartProps } from "../models/IHeroWebPartProps";

export interface IComponentsProps {
  spHttpClient: SPHttpClient;
  pageContext: any;
  properties: IHeroWebPartProps;
  strings: any;
  onSourceUpdated: (listId: string, listTitle: string) => void;
}
