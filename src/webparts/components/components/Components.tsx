import * as React from "react";
import styles from "./Components.module.scss";
import { IComponentsProps } from "./IComponentsProps";
import { HeroDataService, IListOption } from "../services/HeroDataService";
import { IHeroItem } from "../models/IHeroItem";

export interface IComponentsState {
  items: IHeroItem[];
  availableLists: IListOption[];
  selectedListId: string;
  isLoading: boolean;
  isCreating: boolean;
  error: string;
  message: string;
  activeIndex: number;
  isArabic: boolean;
}

export default class HeroComponents extends React.Component<
  IComponentsProps,
  IComponentsState
> {
  private heroDataService: HeroDataService;
  private rotationTimer: number = 5000;

  constructor(props: IComponentsProps) {
    super(props);

    const cultureName =
      (this.props.pageContext &&
        this.props.pageContext.cultureInfo &&
        this.props.pageContext.cultureInfo.currentUICultureName) ||
      "en-US";

    this.state = {
      items: [],
      availableLists: [],
      selectedListId: this.props.properties.dataSourceListId || "",
      isLoading: true,
      isCreating: false,
      error: "",
      message: "",
      activeIndex: 0,
      isArabic: cultureName.toLowerCase().indexOf("ar") === 0,
    };

    this.heroDataService = new HeroDataService(
      this.props.pageContext.web.absoluteUrl,
      this.props.spHttpClient,
      cultureName,
    );
  }

  public componentDidMount(): void {
    this.loadAvailableLists();
    if (this.props.properties.dataSourceListId) {
      this.loadHeroItems(this.props.properties.dataSourceListId);
    } else {
      this.setState({ isLoading: false });
    }
  }

  public componentDidUpdate(prevProps: IComponentsProps): void {
    if (
      prevProps.properties.dataSourceListId !==
      this.props.properties.dataSourceListId
    ) {
      this.setState({
        selectedListId: this.props.properties.dataSourceListId || "",
        error: "",
        message: this.props.properties.dataSourceListTitle
          ? this.props.properties.dataSourceListTitle
          : "",
      });

      if (this.props.properties.dataSourceListId) {
        this.loadHeroItems(this.props.properties.dataSourceListId);
      }
    }
  }

  public componentWillUnmount(): void {
    if (this.rotationTimer) {
      window.clearInterval(this.rotationTimer);
    }
  }

  public render(): React.ReactElement<IComponentsProps> {
    const isConfigured = !!this.props.properties.dataSourceListId;
    const showNavigation = this.props.properties.showNavigation !== false;
    const showPagination = this.props.properties.showPagination !== false;
    const currentItem = this.state.items[this.state.activeIndex];

    return (
      <div
        className={styles.heroWrapper}
        dir={this.state.isArabic ? "rtl" : "ltr"}
      >
        {isConfigured
          ? this.renderHero(currentItem, showNavigation, showPagination)
          : this.renderConfiguration()}
      </div>
    );
  }

  private renderConfiguration(): React.ReactElement<{}> {
    const existingListOptions = this.state.availableLists.map((item) => {
      return (
        <option key={item.key} value={item.key}>
          {item.text}
        </option>
      );
    });

    return (
      <div className={styles.configurationPanel}>
        <div className={styles.configHeader}>
          <h3>{this.props.strings.ConfigureHeroTitle}</h3>
          <p>{this.props.strings.ConfigureHeroDescription}</p>
        </div>

        <div className={styles.configContent}>
          <label className={styles.label} htmlFor="heroListSelect">
            {this.props.strings.ExistingListLabel}
          </label>
          <select
            id="heroListSelect"
            className={styles.listSelect}
            value={this.state.selectedListId}
            onChange={this.onListSelectionChanged}
          >
            <option value="">{this.props.strings.SelectListPlaceholder}</option>
            {existingListOptions}
          </select>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={this.useSelectedList}
              disabled={!this.state.selectedListId || this.state.isCreating}
            >
              {this.props.strings.UseSelectedListButton}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={this.createHeroList}
              disabled={this.state.isCreating}
            >
              {this.state.isCreating
                ? this.props.strings.CreatingListButton
                : this.props.strings.CreateHeroListButton}
            </button>
          </div>

          {this.state.error ? (
            <div className={styles.errorMessage}>{this.state.error}</div>
          ) : null}
          {this.state.message ? (
            <div className={styles.successMessage}>{this.state.message}</div>
          ) : null}
        </div>
      </div>
    );
  }

  private renderHero(
    currentItem: IHeroItem,
    showNavigation: boolean,
    showPagination: boolean,
  ): React.ReactElement<{}> {
    const heroHeight = this.props.properties.heroHeight || 420;
    const overlayStrength = this.props.properties.overlayStrength || 50;
    const useArabic = this.state.isArabic;
    const heroLayout = this.props.properties.heroLayout || "carousel";
    const textAlign = this.props.properties.textAlign || "left";
    const textAlignmentClass =
      textAlign === "center"
        ? styles.textCenter
        : textAlign === "right"
          ? styles.textRight
          : styles.textLeft;

    const layoutClass =
      heroLayout === "feature"
        ? styles.featureLayout
        : heroLayout === "full-width"
          ? styles.fullWidthLayout
          : styles.carouselLayout;

    const isCarousel = heroLayout === "carousel";
    const heroContent = currentItem ? (
      <div className={styles.slideInner}>
        <div
          className={styles.imageLayer}
          style={{
            backgroundImage: currentItem.imageUrl
              ? `url('${currentItem.imageUrl}')`
              : `url('${this.props.properties.fallbackImageUrl || ""}')`,
          }}
        />
        <div className={styles.visualScene} aria-hidden="true">
          <span className={styles.visualRing} />
          <span className={styles.visualAccent} />
        </div>
        <div
          className={styles.overlay}
          style={{ opacity: overlayStrength / 100 }}
        />
        <div className={styles.contentLayer + " " + textAlignmentClass}>
          <h2>{currentItem.title}</h2>
          <p>{currentItem.description}</p>
          {currentItem.linkUrl ? (
            <a
              href={currentItem.linkUrl}
              target={
                this.props.properties.openLinksInNewWindow ? "_blank" : "_self"
              }
              rel={
                this.props.properties.openLinksInNewWindow
                  ? "noopener noreferrer"
                  : undefined
              }
              className={styles.ctaButton}
            >
              {currentItem.linkText}
            </a>
          ) : null}
        </div>
      </div>
    ) : null;

    return (
      <div
        className={styles.heroShell + " " + layoutClass}
        style={{ minHeight: heroHeight }}
      >
        {this.state.isLoading ? (
          <div className={styles.loadingState}>
            {this.props.strings.LoadingMessage}
          </div>
        ) : null}
        {this.state.error ? (
          <div className={styles.errorState}>{this.state.error}</div>
        ) : null}
        {!this.state.isLoading &&
        !this.state.error &&
        this.state.items.length === 0 ? (
          <div className={styles.emptyState}>
            {this.props.strings.EmptyStateMessage}
          </div>
        ) : null}

        {this.state.items.length > 0 && currentItem ? (
          <div className={styles.heroViewport}>
            {isCarousel && showNavigation ? (
              <div className={styles.navButtons}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={this.previousSlide}
                  aria-label={this.props.strings.PreviousSlideLabel}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={this.nextSlide}
                  aria-label={this.props.strings.NextSlideLabel}
                >
                  ›
                </button>
              </div>
            ) : null}

            {heroContent}

            {isCarousel && showPagination ? (
              <div className={styles.pagination}>
                {this.state.items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      index === this.state.activeIndex
                        ? styles.paginationDotActive
                        : styles.paginationDot
                    }
                    onClick={() => this.setActiveIndex(index)}
                    aria-label={
                      this.props.strings.PaginationLabel + " " + (index + 1)
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  private loadAvailableLists = async (): Promise<void> => {
    try {
      const availableLists = await this.heroDataService.getAvailableLists();
      this.setState({
        availableLists: availableLists,
        selectedListId:
          this.props.properties.dataSourceListId || this.state.selectedListId,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        // error: error.message || this.props.strings.ErrorLoadingListsMessage,
        isLoading: false,
      });
    }
  };

  private loadHeroItems = async (listId: string): Promise<void> => {
    this.setState({ isLoading: true, error: "", message: "" });

    try {
      const items = await this.heroDataService.getHeroItems(listId);
      if (items.length > 0) {
        await this.preloadImage(items[0].imageUrl || "");
        this.preloadRemainingImages(items.slice(1));
      }

      this.setState({ items: items, isLoading: false, activeIndex: 0 });
      this.startAutoRotation(items);
    } catch (error) {
      this.setState({
        error: this.props.strings.ErrorLoadingItemsMessage,
        isLoading: false,
      });
    }
  };

  private preloadImage(imageUrl: string): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!imageUrl) {
        resolve();
        return;
      }

      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = imageUrl;
    });
  }

  private preloadRemainingImages(items: IHeroItem[]): void {
    items.forEach((item) => {
      if (item.imageUrl) {
        const image = new Image();
        image.src = item.imageUrl;
      }
    });
  }

  private onListSelectionChanged = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    this.setState({ selectedListId: event.target.value });
  };

  private useSelectedList = async (): Promise<void> => {
    if (!this.state.selectedListId) {
      return;
    }

    const selectedList = this.state.availableLists.filter(
      (item) => item.key === this.state.selectedListId,
    )[0];

    if (!selectedList) {
      this.setState({ error: this.props.strings.ListSelectionErrorMessage });
      return;
    }

    const validationResult = await this.heroDataService.validateList(
      this.state.selectedListId,
    );

    if (!validationResult.isValid) {
      this.setState({
        error:
          this.props.strings.MissingFieldsMessage +
          " " +
          validationResult.missingFields.join(", "),
        message: "",
      });
      return;
    }

    // this.props.onSourceUpdated(this.state.selectedListId, selectedList.text);
    // this.setState({
    //   error: "",
    //   message:
    //     this.props.strings.ListConfiguredMessage + " " + selectedList.text,
    //   isLoading: true,
    // });
    const listId = this.state.selectedListId;
    this.props.onSourceUpdated(listId, selectedList.text);

    this.setState(
      {
        error: "",
        message:
          this.props.strings.ListConfiguredMessage + " " + selectedList.text,
      },
      () => {
        this.loadHeroItems(listId);
      },
    );
  };

  private createHeroList = async (): Promise<void> => {
    this.setState({ isCreating: true, error: "", message: "" });

    try {
      const createdList = await this.heroDataService.createHeroListIfNeeded();
      this.props.onSourceUpdated(createdList.listId, createdList.listTitle);
      // this.setState({
      //   selectedListId: createdList.listId,
      //   isCreating: false,
      //   message:
      //     this.props.strings.ListCreatedMessage + " " + createdList.listTitle,
      // });
      this.setState(
        {
          selectedListId: createdList.listId,
          isCreating: false,
          message:
            this.props.strings.ListCreatedMessage + " " + createdList.listTitle,
        },
        () => {
          this.loadHeroItems(createdList.listId);
        },
      );
    } catch (error) {
      this.setState({
        // error: error.message || this.props.strings.CreateListErrorMessage,
        isCreating: false,
      });
    }
  };

  private startAutoRotation = (items: IHeroItem[]): void => {
    if (this.rotationTimer) {
      window.clearInterval(this.rotationTimer);
    }

    if (!this.props.properties.autoRotate || items.length <= 1) {
      return;
    }

    const interval = (this.props.properties.rotationInterval || 5) * 1000;

    this.rotationTimer = window.setInterval(() => {
      this.setState((prevState) => {
        const nextIndex =
          prevState.activeIndex + 1 >= items.length
            ? 0
            : prevState.activeIndex + 1;
        return { activeIndex: nextIndex };
      });
    }, interval);
  };

  private previousSlide = (): void => {
    this.setState((prevState) => {
      const nextIndex =
        prevState.activeIndex - 1 < 0
          ? this.state.items.length - 1
          : prevState.activeIndex - 1;
      return { activeIndex: nextIndex };
    });
  };

  private nextSlide = (): void => {
    this.setState((prevState) => {
      const nextIndex =
        prevState.activeIndex + 1 >= this.state.items.length
          ? 0
          : prevState.activeIndex + 1;
      return { activeIndex: nextIndex };
    });
  };

  private setActiveIndex = (index: number): void => {
    this.setState({ activeIndex: index });
  };
}
