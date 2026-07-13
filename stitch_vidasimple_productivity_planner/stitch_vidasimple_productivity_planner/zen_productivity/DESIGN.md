---
name: Zen Productivity
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  safe_margin: 20px
  gutter: 16px
---

## Brand & Style
The design system is anchored in a philosophy of "Clarity through Calm." It targets high-achieving professionals and students who seek an escape from cluttered productivity tools. The visual style is a blend of **Corporate Modern** and **Minimalism**, prioritizing generous whitespace to reduce cognitive load and using subtle motion to guide the user's focus.

The emotional response should be one of quiet confidence—professional enough to be trusted with complex tasks, yet friendly and elegant enough to feel like a personal lifestyle companion rather than a rigid enterprise tool.

## Colors
The palette uses a sophisticated "Digital Sky" primary blue to establish trust, complemented by a "Fresh Mint" secondary for growth-oriented actions. The background remains exceptionally light to maintain a sense of airiness. 

- **Primary:** Used for main action buttons and active states.
- **Secondary:** Used for secondary features, progress indicators, and completion highlights.
- **Neutral:** The background (#F8FAFC) should be used as the canvas, with cards occasionally utilizing a pure white (#FFFFFF) to create subtle layering.
- **Text:** The main text color is a deep navy-charcoal, providing high legibility without the harshness of pure black.

## Typography
This design system utilizes **Inter** for its exceptional legibility on mobile screens. The typographic hierarchy is strictly enforced: large, bold headings provide immediate context, while body text uses generous line heights to ensure readability during long planning sessions. Label styles use slight letter-spacing increases for better distinction at small sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for Android mobile. It employs a 4-column system for most content, with a 20px safe margin on the horizontal edges. 

The spacing rhythm is based on a 4px baseline, but the "spacious" feel is achieved by defaulting to `lg` (24px) or `xl` (32px) padding for container interiors. Hierarchy is established through white space rather than lines; let the empty space define the boundaries of content blocks.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and **Tonal Layers**. Instead of harsh drop shadows, this design system uses soft, diffused blurs with a slight hint of the primary blue in the shadow mix to maintain a modern feel.

- **Level 0 (Base):** The Background (#F8FAFC).
- **Level 1 (Cards):** Pure White (#FFFFFF) with a 12% opacity shadow, 16px blur, and 4px vertical offset.
- **Level 2 (Active/Floating):** Pure White (#FFFFFF) with a 20% opacity shadow, 24px blur, and 8px vertical offset.

Avoid using borders for containers; allow the subtle shadows to define the separation between the card and the background.

## Shapes
The shape language is defined by **Large Rounded Borders**, reinforcing the friendly and elegant aesthetic. 

- **Primary Containers/Cards:** Use a 16px (1rem) radius.
- **Buttons:** Use a fully rounded pill-shape (24px+) to make them appear "tappable" and friendly.
- **Inputs:** Use an 8px (0.5rem) radius for a more structured, professional look compared to the cards.

## Components
- **Buttons:** Primary buttons are solid Blue (#2563EB) with white text. Secondary buttons use a light Mint tint (#14B8A6 at 10% opacity) with Mint text.
- **Soft Cards:** All cards must have 16px corner radii and the Level 1 Ambient Shadow. Internal padding should never be less than 20px.
- **Lists:** Use "Invisibile" list items where separators are only 1px tall and 10% opacity, or simply grouped within a single soft card.
- **Input Fields:** Background-filled with a slightly darker gray than the app background; focus state triggers a 2px primary blue border.
- **Icons:** Use linear, 2px stroke-width icons. Icons should be monochrome (Main Text color) unless used as a status indicator.
- **Progress Trackers:** Utilize the Secondary Mint Green to indicate positive momentum and completion.
- **Chips:** Small, rounded-pill containers used for categorization, utilizing light tints of the status colors.