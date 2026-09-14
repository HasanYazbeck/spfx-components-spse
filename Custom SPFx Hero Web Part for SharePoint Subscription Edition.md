Act as a Senior SharePoint Framework (SPFx), React, TypeScript, and SharePoint Server Subscription Edition developer.

I need you to design and implement a production-ready **Custom Hero SPFx Web Part** for an **on-premises SharePoint Server Subscription Edition environment**.

The web part must look and behave like a native Modern SharePoint component while remaining fully compatible with the SPFx version supported by SharePoint Server Subscription Edition.

## 1. Platform and Compatibility Requirements

The solution must target:

- SharePoint Server Subscription Edition running on-premises.
- SPFx 1.5.1 or the highest version actually supported by the target Subscription Edition farm.
- React and TypeScript versions compatible with that SPFx version.
- The legacy Gulp-based SPFx build pipeline appropriate for SPFx 1.5.x.
- SharePoint REST API for SharePoint data access where required.

Do NOT use APIs, packages, React features, Fluent UI versions, SPFx APIs, hooks, or functionality introduced in newer SharePoint Online-only SPFx versions.

Before using any API or library, verify that it is compatible with SPFx 1.5.x and SharePoint Server Subscription Edition.

The final project must be buildable into an `.sppkg` package and deployable to the on-premises SharePoint App Catalog.

---

## 2. Custom Hero Web Part

Create a reusable SPFx web part named something similar to:

`DynamicHeroWebPart`

The component should provide a modern Hero/Banner experience comparable to the visual design and behavior of Microsoft's Modern SharePoint Hero web part.

The Hero must retrieve its content dynamically from a SharePoint List instead of having the Hero content hard-coded inside the web part.

Each Hero item should be capable of containing information such as:

- Title
- Subtitle or Description
- Image
- Link
- Link/CTA text
- Display Order
- Enabled / Disabled status
- Arabic Title
- Arabic Description
- Arabic CTA Text
- Optional Arabic image if required

Design the data model so additional Hero properties can easily be introduced later.

---

## 3. First-Time Configuration Experience

When an administrator or authorized user adds the Hero Web Part to a SharePoint page for the first time, the web part should detect that it has not yet been configured.

Instead of immediately showing an empty Hero, display a professional configuration experience.

The configuration interface should provide two options:

### Option A – Use Existing SharePoint List

Allow the administrator to select an existing SharePoint List as the Hero's data source.

The configuration should:

1. Retrieve available SharePoint Lists from the current site.
2. Allow the administrator to select a list.
3. Validate that the selected list contains the required fields.
4. Display a useful validation message when required columns are missing.
5. Save the selected List ID or another stable identifier inside the web part properties.
6. Use that list as the dynamic Hero content source.

Avoid relying only on the list title because the list may later be renamed.

### Option B – Create Hero List Automatically

Provide another option:

**Create Hero Data Source**

When selected, the SPFx web part should automatically create the required SharePoint List and columns if the user has sufficient permissions.

For example:

List Name:

`HeroContent`

Suggested fields:

- Title
- TitleAR
- DescriptionEN
- DescriptionAR
- ImageUrl
- ImageUrlAR
- LinkUrl
- LinkTextEN
- LinkTextAR
- DisplayOrder
- IsActive
- OpenInNewTab

Adjust this schema if a more appropriate SharePoint field structure is recommended.

After successfully creating the list:

1. Store the List ID in the web part configuration.
2. Display confirmation to the administrator.
3. Allow the administrator to start entering Hero content into the list.
4. Refresh the Hero automatically when appropriate.

Do not recreate the list if it already exists.

Handle insufficient permissions, duplicate lists, REST errors, missing columns, and network errors gracefully.

---

## 4. Property Pane Configuration

Use the SPFx Property Pane wherever appropriate.

The administrator should be able to configure settings such as:

- Data source list
- Hero layout
- Maximum number of slides/items
- Auto rotation enabled/disabled
- Rotation interval
- Show/hide navigation controls
- Show/hide pagination indicators
- Hero height
- Text alignment
- Overlay strength
- Open links in current/new window
- Optional fallback image

Where possible, configuration options should have professional descriptions and validation.

The web part should show a friendly configuration message when the required list has not yet been configured.

---

## 5. Dynamic SharePoint List Integration

Create a dedicated service layer for SharePoint operations rather than placing all REST calls directly inside the React component.

For example:

`services/HeroDataService.ts`

Responsibilities should include:

- Get available SharePoint Lists.
- Validate selected Hero List.
- Create Hero List.
- Create required Hero fields.
- Retrieve Hero items.
- Sort Hero items.
- Filter active Hero items.
- Handle SharePoint REST errors.
- Map SharePoint List items into strongly typed Hero objects.

Create TypeScript interfaces such as:

`IHeroItem`

`IHeroDataService`

`IHeroWebPartProps`

`IHeroComponentProps`

Keep data access, business logic, rendering, and styling separated.

---

## 6. English / Arabic Localization

The Hero Web Part must fully support both:

- English
- Arabic

The language must follow the active/current SharePoint user interface language.

Do not create a completely independent language selector unless required as an optional override.

Determine the current SharePoint language/culture through the SPFx page context or another API available in SPFx 1.5.x.

For example, detect cultures such as:

`en-US`

`ar-SA`

`ar-LB`

and determine whether the active culture is Arabic.

When English is active:

- Use English Hero fields.
- Apply `dir="ltr"`.
- Align content correctly for LTR layouts.
- Display English property/configuration strings where applicable.

When Arabic is active:

- Use Arabic Hero fields.
- Apply `dir="rtl"`.
- Properly mirror the Hero layout.
- Align text appropriately.
- Reverse navigation controls when appropriate.
- Display Arabic CTA text.
- Use Arabic labels/configuration strings where applicable.

Use the normal SPFx localization model.

Create localization resource files similar to:

`loc/en-us.js`

`loc/ar-sa.js`

with the same localization keys.

Do not hard-code user-interface strings directly inside React components.

---

## 7. RTL/LTR Styling

Arabic support must be implemented correctly rather than simply changing the text.

The web part should dynamically support:

`direction: rtl`

and:

`direction: ltr`

depending on the current culture.

Consider RTL behavior for:

- Headings
- Descriptions
- CTA buttons
- Navigation arrows
- Pagination
- Text overlays
- Margins
- Padding
- Icons
- Flexbox positioning
- Hero content positioning

Avoid duplicating the complete stylesheet for Arabic where possible.

Use reusable modifier classes such as:

`.rtl`

`.ltr`

or equivalent architecture.

---

## 8. Responsive Design

The Hero Web Part must be fully responsive.

It must display correctly on:

### Desktop
- Large displays
- Standard desktop resolutions
- Full-width SharePoint sections

### Tablet
- Landscape
- Portrait

### Mobile
- Modern mobile browsers
- Narrow page sections
- SharePoint mobile layouts where supported

The layout should respond to the actual available container width rather than depending only on the browser width.

Images should:

- Maintain proper aspect ratio.
- Avoid stretching.
- Use appropriate `object-fit`.
- Remain visually attractive when the component becomes narrow.

Text should remain readable and CTA buttons should remain easily accessible.

Use responsive CSS/media queries compatible with the browsers supported by SharePoint Server Subscription Edition.

---

## 9. SharePoint Theme and Branding Integration

The Hero must not use fixed hard-coded branding colors for elements that should follow the SharePoint theme.

The web part should automatically adapt when the SharePoint site's theme changes.

Where supported by SPFx 1.5.x, use SharePoint theme values/tokens available to that SPFx generation instead of APIs introduced in newer SPFx versions.

The Hero should derive appropriate styling for elements such as:

- Primary/accent color
- Text colors
- Background colors
- Link colors
- Button colors
- Hover states
- Borders

If certain newer SPFx theme APIs are unavailable in SPFx 1.5.x, implement the closest supported SharePoint theme-token approach rather than introducing an incompatible API.

The objective is that changing the SharePoint site theme automatically makes the Hero visually consistent with the new theme.

Avoid unnecessary hard-coded colors.

---

## 10. Modern SharePoint Look and Feel

The Hero should visually feel like a native Modern SharePoint component.

Follow Modern SharePoint design principles such as:

- Clean layout
- Strong imagery
- Modern typography
- Consistent spacing
- Minimal visual clutter
- Accessible color contrast
- Subtle overlays
- Professional CTA buttons
- Modern hover/focus behavior
- SharePoint-like navigation controls
- Smooth but subtle transitions

Do not create an overly customized third-party-looking carousel.

It should look like something that naturally belongs inside a Modern SharePoint Communication Site.

---

## 11. Hero Layouts

Design the component so layouts can be extended later.

At minimum support a primary large Hero layout.

Preferably structure the architecture so future layouts can include:

- Full-width Hero
- Single Hero banner
- Hero carousel
- Multiple tiles
- Featured item + smaller tiles

The administrator should eventually be able to select the layout using the Property Pane.

For the initial implementation, prioritize quality and maintainability over adding unnecessary layout complexity.

---

## 12. Accessibility

Follow reasonable accessibility practices.

Implement:

- Semantic HTML
- Keyboard-accessible navigation
- Proper button elements
- `aria-label` attributes where appropriate
- Image alternative text
- Visible keyboard focus
- Sufficient text/background contrast
- Reduced dependence on color alone
- Proper RTL accessibility behavior

Hero auto-rotation should not make the web part difficult to use with keyboard or assistive technologies.

---

## 13. Performance

Optimize the web part for an enterprise SharePoint portal.

Requirements:

- Avoid unnecessary REST requests.
- Retrieve only required SharePoint fields.
- Filter active records.
- Order records by DisplayOrder.
- Avoid unnecessary React re-renders.
- Properly handle loading states.
- Handle empty data.
- Handle broken image URLs.
- Handle list retrieval errors.
- Avoid unnecessary external dependencies.

Do not introduce a large carousel library unless absolutely necessary.

Prefer implementing required behavior with React and CSS when reasonable.

---

## 14. Suggested Project Architecture

Use a clean folder structure similar to:

src/
webparts/
dynamicHero/
DynamicHeroWebPart.ts
DynamicHeroWebPart.manifest.json

components/
DynamicHero.tsx
IDynamicHeroProps.ts
HeroItem.tsx

models/
IHeroItem.ts
IHeroConfiguration.ts

services/
IHeroDataService.ts
HeroDataService.ts

styles/
DynamicHero.module.scss

loc/
en-us.js
ar-sa.js
mystrings.d.ts

utilities/
LanguageHelper.ts
HeroListHelper.ts

You may improve this structure if there is a better architecture compatible with SPFx 1.5.x.

---

## 15. Error and Empty States

Create professional states for:

### Not configured
Show:

"Configure this Hero Web Part to select or create its content source."

With an appropriate configuration action where technically supported.

### Empty List
Show an editor-friendly message indicating that no active Hero items are available.

Do not display this administrative message to normal visitors if this can be distinguished safely.

### Loading
Show an appropriate lightweight loading indicator.

### Error
Display a user-friendly error rather than exposing raw JavaScript/REST exceptions.

Log useful technical information for administrators/developers where appropriate.

---

## 16. Security and Permissions

The web part must operate in the context of the currently authenticated SharePoint user.

Do not hard-code credentials.

Do not bypass SharePoint permissions.

Users should only retrieve information they are authorized to access.

Creating the Hero list and fields should only succeed when the current user has sufficient SharePoint permissions.

If the user cannot create the list, provide a meaningful error and allow them to select an existing list instead.

---

## 17. Code Quality

Use:

- Strong TypeScript interfaces
- Separation of concerns
- Reusable React components
- Service classes
- Clear naming conventions
- Proper error handling
- Comments only where they add value
- Maintainable SCSS architecture

Avoid:

- `any` wherever possible
- Giant React components
- Direct REST calls scattered through UI components
- Hard-coded site URLs
- Hard-coded list GUIDs
- Hard-coded languages
- Hard-coded branding
- Modern JavaScript/TypeScript features unsupported by the SPFx 1.5.x toolchain

---

## 18. Important Compatibility Constraint

This solution is NOT targeting SharePoint Online.

It is specifically targeting:

**SharePoint Server Subscription Edition On-Premises + SPFx 1.5.x**

Therefore, whenever there is a difference between a modern SharePoint Online implementation and an SPFx 1.5.x implementation, always choose the solution compatible with SPFx 1.5.x.

Do not silently upgrade dependencies to newer versions.

If a requested capability cannot be implemented exactly because SPFx 1.5.x does not expose a newer API, explain the limitation and implement the closest supported alternative.

---

## 19. Expected Deliverables

Generate the solution step by step.

I want you to provide:

1. Recommended SPFx project configuration.
2. Required Node.js version.
3. Required npm packages and exact compatible versions.
4. Yeoman/SPFx project creation commands.
5. Complete folder structure.
6. Web Part TypeScript implementation.
7. React Hero component.
8. TypeScript interfaces/models.
9. SharePoint REST data service.
10. Existing-list selection logic.
11. Automatic Hero list creation logic.
12. Required SharePoint field creation logic.
13. English/Arabic localization implementation.
14. RTL/LTR implementation.
15. Responsive SCSS.
16. SharePoint theme integration.
17. Property Pane implementation.
18. Loading/error/empty/configuration states.
19. Deployment/package configuration.
20. `.sppkg` build commands.
21. SharePoint App Catalog deployment instructions.
22. Example Hero list data in English and Arabic.
23. Explanation of how each major part works.

Do not provide only conceptual examples or pseudo-code.

Generate actual implementation-ready TypeScript, React, SCSS, localization, REST, manifest, and configuration code compatible with the selected SPFx version.

---

## 20. Final Acceptance Criteria

The implementation is complete only when the following scenario works:

1. An administrator adds the Hero Web Part to a Modern SharePoint page.
2. The web part detects that no data source has been configured.
3. The administrator can choose an existing SharePoint List OR create the Hero list automatically.
4. The selected/created list is stored in the Web Part configuration.
5. Hero items are retrieved dynamically from the SharePoint List.
6. English SharePoint UI displays English Hero content in LTR mode.
7. Arabic SharePoint UI displays Arabic Hero content in RTL mode.
8. Mobile, tablet, and desktop layouts render correctly.
9. SharePoint theme changes are reflected by the Hero styling.
10. The component visually matches the Modern SharePoint design language.
11. The solution builds successfully using the SharePoint Subscription Edition-compatible SPFx toolchain.
12. The generated `.sppkg` can be deployed to the on-premises SharePoint App Catalog.
13. No SharePoint Online-only APIs or unsupported newer SPFx functionality are used.

Start by defining the **technical architecture, SharePoint List schema, component structure, data flow, localization strategy, theming strategy, and SPFx 1.5.x compatibility constraints**.

Then generate the implementation step by step, file by file.