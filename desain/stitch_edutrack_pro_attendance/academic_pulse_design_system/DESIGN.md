---
name: Academic Pulse Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fd'
  surface-container: '#ecedf7'
  surface-container-high: '#e6e8f2'
  surface-container-highest: '#e0e2ec'
  on-surface: '#191c23'
  on-surface-variant: '#414754'
  inverse-surface: '#2d3038'
  inverse-on-surface: '#eff0fa'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bc0'
  primary: '#005bbf'
  on-primary: '#ffffff'
  primary-container: '#1a73e8'
  on-primary-container: '#ffffff'
  inverse-primary: '#adc7ff'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#9e4300'
  on-tertiary: '#ffffff'
  tertiary-container: '#c55500'
  on-tertiary-container: '#0e0200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783100'
  background: '#f9f9ff'
  on-background: '#191c23'
  surface-variant: '#e0e2ec'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max-width: 1280px
---

## Brand & Style

This design system is built for institutional efficiency and administrative clarity. The core personality is **Professional, Systematic, and Trustworthy**, prioritizing the ease of high-frequency utility tasks like attendance logging and reporting.

The visual style is **Corporate / Modern**, heavily influenced by the utilitarian elegance of Google Workspace. It utilizes generous negative space to reduce cognitive load for educators and administrators. By combining a "flat" interface with subtle depth cues, the system achieves a reliable, stable feel that fosters confidence in data integrity.

## Colors

The palette is anchored by **Professional Blue**, a color associated with intelligence and dependability. 

- **Primary:** Used for actionable elements, active states, and brand representation.
- **Secondary/Surface:** Pure white is used for card containers and elevated surfaces to create a clean separation from the background.
- **Neutral:** A very light gray (`#F8F9FA`) serves as the application canvas, providing a soft contrast that reduces eye strain during long periods of use.
- **Semantic Palette:** Standardized Success Green, Warning Orange, and Danger Red are utilized strictly for status indicators (e.g., "Present", "Late", "Absent").

## Typography

**Inter** is the sole typeface for this design system, chosen for its exceptional legibility in data-heavy environments. 

The typographic hierarchy relies on weight and subtle scale shifts rather than decorative flourishes. **Headline** roles use medium-to-semibold weights to anchor page sections, while **Body** text remains at a standard 16px for optimal readability of lists and reports. **Label** styles use a slightly increased letter-spacing and uppercase transform to denote metadata and table headers clearly.

## Layout & Spacing

The system follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **The 8px Rhythm:** All spacing (padding, margins, gap) should be multiples of 4px, with 8px and 16px being the most common increments.
- **Content Density:** In dashboard views, use a "Compact" vertical rhythm (8px between list items). In settings or profile views, use "Comfortable" rhythm (16px - 24px) to enhance focus.
- **Sidebars:** Standardize the navigation sidebar at 256px width, collapsible to 64px (icon-only) for increased workspace on smaller laptop screens.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Shadows**. 

1. **Level 0 (Base):** The `#F8F9FA` background.
2. **Level 1 (Card/Surface):** Pure white surfaces with a 1px border in a light neutral (`#E8EAED`) and no shadow.
3. **Level 2 (Active/Hover):** Applied to buttons or interactive cards on hover. Uses a soft, ambient shadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`.
4. **Level 3 (Overlay):** Used for modals and dropdowns. Features a more pronounced shadow: `0px 8px 24px rgba(0, 0, 0, 0.12)`.

Avoid heavy gradients or dark shadows to maintain the minimalist SaaS aesthetic.

## Shapes

The design system uses a **Rounded** shape language to appear modern and approachable while remaining professional.

- **Standard Elements:** Buttons, input fields, and cards utilize a **0.5rem (8px)** corner radius.
- **Large Components:** Modals and large dashboard containers use **1rem (16px)** for a softer, defined container look.
- **Interactive Indicators:** Elements like checkboxes or status dots remain either slightly rounded (2px) or fully circular to distinguish them from structural containers.

## Components

### Buttons
- **Primary:** Solid `#1A73E8` with white text. 8px radius.
- **Secondary:** Outline in primary blue or light gray.
- **Ghost:** No background, blue text. Used for secondary actions in tables.

### Input Fields
- Use a white background with a 1px border (`#DADCE0`).
- On focus, the border thickens to 2px and changes to the Primary Blue. 
- Labels should always be visible above the field (never just placeholders).

### Attendance Chips
- Small, rounded pills used to show status.
- **Present:** Light green background with dark green text.
- **Absent:** Light red background with dark red text.
- **Late:** Light orange background with dark orange text.

### Data Tables
- Header row with a light gray background (`#F1F3F4`).
- Rows should have a subtle hover state (`#F8F9FA`).
- Minimum row height of 48px to ensure touch targets are accessible on tablets.

### Cards
- White background, 8px radius, subtle 1px border.
- Used to group related statistics (e.g., "Total Teachers", "Current Attendance %").