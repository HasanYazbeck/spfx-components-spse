export interface IHeroItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  displayOrder: number;
  isActive: boolean;
  openInNewTab?: boolean;
  titleAr?: string;
  descriptionAr?: string;
  linkTextAr?: string;
  imageUrlAr?: string;
}
