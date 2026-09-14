declare interface IComponentsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  GeneralGroupName: string;
  DescriptionFieldLabel: string;
  ConfigureHeroTitle: string;
  ConfigureHeroDescription: string;
  ExistingListLabel: string;
  SelectListPlaceholder: string;
  UseSelectedListButton: string;
  CreateHeroListButton: string;
  CreatingListButton: string;
  LoadingMessage: string;
  EmptyStateMessage: string;
  ErrorLoadingListsMessage: string;
  ErrorLoadingItemsMessage: string;
  MissingFieldsMessage: string;
  ListConfiguredMessage: string;
  ListCreatedMessage: string;
  CreateListErrorMessage: string;
  ListSelectionErrorMessage: string;
  PreviousSlideLabel: string;
  NextSlideLabel: string;
  PaginationLabel: string;
  HeroLayoutLabel: string;
  LayoutFullWidth: string;
  LayoutFeature: string;
  LayoutCarousel: string;
  MaxItemsLabel: string;
  MaxItemsDescription: string;
  AutoRotateLabel: string;
  RotationIntervalLabel: string;
  RotationIntervalDescription: string;
  ShowNavigationLabel: string;
  ShowPaginationLabel: string;
  HeroHeightLabel: string;
  HeroHeightDescription: string;
  TextAlignLabel: string;
  TextAlignLeft: string;
  TextAlignCenter: string;
  TextAlignRight: string;
  OverlayStrengthLabel: string;
  OverlayStrengthDescription: string;
  OpenLinksInNewWindowLabel: string;
  FallbackImageUrlLabel: string;
  FallbackImageDescription: string;
}

declare module "ComponentsWebPartStrings" {
  const strings: IComponentsWebPartStrings;
  export = strings;
}
