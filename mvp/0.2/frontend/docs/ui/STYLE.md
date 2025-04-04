# LyraClipMAP Style Guide

This style guide documents the visual design language, UI components, and style conventions for the LyraClipMAP application. It serves as a comprehensive reference for maintaining a consistent, accessible, and visually cohesive user experience across the application.

## 1. Color System

### 1.1 Primary Color Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary | `#6200EA` | `rgb(98, 0, 234)` | Main brand color, primary buttons, active elements |
| Primary Light | `#9D46FF` | `rgb(157, 70, 255)` | Hover states, secondary elements |
| Primary Dark | `#0A00B6` | `rgb(10, 0, 182)` | Pressed states, emphasis |

### 1.2 Secondary Color Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Secondary | `#03DAC6` | `rgb(3, 218, 198)` | Accent elements, highlights, success states |
| Secondary Light | `#66FFF8` | `rgb(102, 255, 248)` | Hover states, backgrounds |
| Secondary Dark | `#00A896` | `rgb(0, 168, 150)` | Pressed states, borders |

### 1.3 Surface Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Background (Light) | `#F5F5F5` | `rgb(245, 245, 245)` | Main application background in light mode |
| Background (Dark) | `#121212` | `rgb(18, 18, 18)` | Main application background in dark mode |
| Surface (Light) | `#FFFFFF` | `rgb(255, 255, 255)` | Card backgrounds, elevated surfaces in light mode |
| Surface (Dark) | `#1E1E1E` | `rgb(30, 30, 30)` | Card backgrounds, elevated surfaces in dark mode |

### 1.4 Semantic Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Error | `#B00020` / `#CF6679` | `rgb(176, 0, 32)` / `rgb(207, 102, 121)` | Error states, destructive actions |
| Success | `#4CAF50` | `rgb(76, 175, 80)` | Success states, confirmations |
| Warning | `#FB8C00` | `rgb(251, 140, 0)` | Warning states, caution indicators |
| Info | `#2196F3` | `rgb(33, 150, 243)` | Informational elements |

### 1.5 Text Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| On Primary | `#FFFFFF` | `rgb(255, 255, 255)` | Text on primary color |
| On Secondary | `#000000` | `rgb(0, 0, 0)` | Text on secondary color |
| On Background (Light) | `#000000` | `rgb(0, 0, 0)` | Text on light backgrounds |
| On Background (Dark) | `#FFFFFF` | `rgb(255, 255, 255)` | Text on dark backgrounds |
| High Emphasis | `rgba(0,0,0,0.87)` / `rgba(255,255,255,0.87)` | | Primary text, important content |
| Medium Emphasis | `rgba(0,0,0,0.6)` / `rgba(255,255,255,0.6)` | | Secondary text, supporting content |
| Disabled | `rgba(0,0,0,0.38)` / `rgba(255,255,255,0.38)` | | Disabled text, inactive elements |

## 2. Typography

### 2.1 Font Family

- Primary Font: **Roboto**
- Fallback: Sans-serif

```css
font-family: 'Roboto', sans-serif;
```

### 2.2 Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| h1 | `2.5rem` (40px) | 700 | 1.2 | -0.03125em | Main page titles |
| h2 | `2rem` (32px) | 700 | 1.3 | -0.03125em | Section headings, song titles |
| h3 | `1.5rem` (24px) | 500 | 1.4 | 0 | Subsection headings, artist names |
| h4 | `1.25rem` (20px) | 500 | 1.4 | 0.0125em | Smaller headings |
| Body 1 | `1rem` (16px) | 400 | 1.5 | 0.03125em | Regular text, lyrics content |
| Body 2 | `0.875rem` (14px) | 400 | 1.5 | 0.0179em | Secondary text, metadata |
| Caption | `0.75rem` (12px) | 400 | 1.5 | 0.025em | Small text, timestamps |
| Button | `0.875rem` (14px) | 500 | 1.25 | 0.0892em | Button text |

### 2.3 Text Styles

```css
/* Truncate long text with ellipsis */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Preserve line breaks in lyrics */
.lyrics-display {
  white-space: pre-wrap;
  line-height: 1.6;
}
```

## 3. Layout & Spacing

### 3.1 Grid System

The application uses Vuetify's 12-column grid system for responsive layouts:

```html
<v-row>
  <v-col cols="12" sm="6" md="4" lg="3">
    <!-- Content -->
  </v-col>
</v-row>
```

### 3.2 Spacing Scale

Base unit: `8px`

| Multiplier | Value | Usage |
|------------|-------|-------|
| 2 | `16px` | Default spacing between related elements |
| 3 | `24px` | Default margin between components |
| 4 | `32px` | Larger sections padding |
| 5 | `40px` | Spacing between major sections |
| 6 | `48px` | Page section margins |

### 3.3 Container Widths

```css
/* Main content width constraints */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
}
```

### 3.4 Breakpoints

| Name | Width | Description |
|------|-------|-------------|
| xs | < 600px | Small phones |
| sm | 600px - 959px | Phones and small tablets |
| md | 960px - 1279px | Tablets and small laptops |
| lg | 1280px - 1919px | Desktops and large laptops |
| xl | ≥ 1920px | Large desktops |

## 4. Component Styles

### 4.1 Cards

```html
<v-card elevation="1" rounded="lg" class="h-100">
  <v-img height="160" cover />
  <v-card-title class="text-subtitle-1 text-truncate">Title</v-card-title>
  <v-card-subtitle class="text-caption text-truncate">Subtitle</v-card-subtitle>
  <v-card-actions>
    <!-- Actions -->
  </v-card-actions>
</v-card>
```

### 4.2 Buttons

#### Primary Button
```html
<v-btn color="primary" variant="elevated">Button Text</v-btn>
```

#### Secondary Button
```html
<v-btn color="primary" variant="outlined">Button Text</v-btn>
```

#### Text Button
```html
<v-btn variant="text">Button Text</v-btn>
```

#### Icon Button
```html
<v-btn icon="mdi-play" variant="text" />
```

### 4.3 Form Components

#### Text Fields
```html
<v-text-field
  label="Label"
  variant="outlined"
  prepend-inner-icon="mdi-magnify"
  hide-details
  density="compact"
/>
```

#### Select Menus
```html
<v-select
  label="Select"
  variant="outlined"
  :items="items"
  item-title="name"
  item-value="id"
  density="compact"
/>
```

#### Checkbox & Switches
```html
<v-checkbox label="Checkbox" hide-details />
<v-switch label="Switch" hide-details />
```

## 5. Effects & Animation

### 5.1 Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| 1 | `0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12)` | Default cards, subtle elevation |
| 2 | `0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)` | Navigation, app bar |
| 3 | `0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)` | Dialogs, elevated content |

### 5.2 Transitions

| Name | Timing | Usage |
|------|--------|-------|
| Standard | `0.3s cubic-bezier(0.4, 0, 0.2, 1)` | Most UI animations |
| Emphasis | `0.4s cubic-bezier(0.0, 0, 0.2, 1)` | Important animations that need emphasis |

### 5.3 Specific Animations

#### Waveform Animation
Subtle pulse animation for the active audio waveform:

```css
.waveform-active {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% { transform: scaleY(1); }
  100% { transform: scaleY(1.1); }
}
```

#### Lyrics Highlight
Transition for synchronized lyrics highlighting:

```css
.lyric-line {
  transition: background-color 0.3s ease;
}

.lyric-line.active {
  background-color: rgba(98, 0, 234, 0.1);
}

.karaoke-word {
  transition: color 0.1s ease, font-weight 0.1s ease;
}

.karaoke-word.highlighted {
  color: #6200EA;
  font-weight: bold;
}
```

## 6. Icons

### 6.1 Icon System

The application uses Material Design Icons (MDI) for consistent iconography:

```html
<v-icon icon="mdi-play" />
```

### 6.2 Common Icons

| Action | Icon | Code |
|--------|------|------|
| Play | Play | `mdi-play` |
| Pause | Pause | `mdi-pause` |
| Add Song | Music Note Plus | `mdi-music-note-plus` |
| Edit | Pencil | `mdi-pencil` |
| Delete | Delete | `mdi-delete` |
| Search | Magnify | `mdi-magnify` |
| Settings | Cog | `mdi-cog` |
| Back | Arrow Left | `mdi-arrow-left` |
| More Actions | Dots Vertical | `mdi-dots-vertical` |
| Playlist | Playlist Music | `mdi-playlist-music` |
| Home | Home | `mdi-home` |
| User | Account | `mdi-account` |
| Youtube | Youtube | `mdi-youtube` |
| Lyrics | Text | `mdi-text` |

## 7. Accessibility

### 7.1 Color Contrast

- All text should maintain a contrast ratio of at least 4.5:1 against its background
- Interactive elements should have a contrast ratio of at least 3:1 against adjacent colors

### 7.2 Focus States

All interactive elements should have a visible focus state:

```css
:focus {
  outline: 2px solid #6200EA;
  outline-offset: 2px;
}
```

### 7.3 Text Size

- Minimum text size for body text: 16px
- Line height of at least 1.5 for readability

### 7.4 Alternative Text

All meaningful images must include descriptive alt text:

```html
<v-img src="image.jpg" alt="Descriptive text about the image" />
```

## 8. Component-Specific Guidelines

### 8.1 WavePlayer

- Waveform color: `#A0AEC0`
- Progress color: `#6200EA`
- Cursor color: `#03DAC6`
- Cursor width: 2px
- Default height: 80px

### 8.2 LyricsDisplay

- Line spacing: 1.6
- Active line font weight: Bold
- Active line background: `rgba(98, 0, 234, 0.1)`
- Past lines opacity: 0.6
- Translation line font style: Italic
- Translation line opacity: 0.7

### 8.3 App Bar

- Color: Primary (`#6200EA`)
- Elevation: 2
- Position: Fixed
- Content alignment: Center vertically

### 8.4 Navigation Drawer

- Rail width: 56px
- Full width: 256px
- List item height: 48px
- Active item background: `rgba(98, 0, 234, 0.1)`

## 9. Templates

### 9.1 Page Structure

```html
<div class="page-container">
  <!-- Page Header -->
  <div class="d-flex align-center mb-6">
    <h1 class="text-h4">Page Title</h1>
    <v-spacer />
    <v-btn color="primary" prepend-icon="mdi-plus">Action</v-btn>
  </div>
  
  <!-- Page Content -->
  <v-card>
    <!-- Card Content -->
  </v-card>
</div>
```

### 9.2 List/Grid View Toggle

```html
<v-btn-group variant="outlined" rounded>
  <v-btn prepend-icon="mdi-view-grid" :active="viewMode === 'grid'" @click="viewMode = 'grid'">Grid</v-btn>
  <v-btn prepend-icon="mdi-view-list" :active="viewMode === 'list'" @click="viewMode = 'list'">List</v-btn>
</v-btn-group>
```

## 10. Implementation Guidelines

### 10.1 Vue 3 + Vuetify

The application uses Vue 3 with the Composition API and Vuetify 3 for UI components:

```js
// Use Vuetify's theme system
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#6200EA',
          secondary: '#03DAC6',
          // ...other colors
        }
      },
      dark: {
        colors: {
          primary: '#6200EA',
          secondary: '#03DAC6',
          background: '#121212',
          surface: '#1E1E1E',
          // ...other colors
        }
      }
    }
  }
})
```

### 10.2 Custom CSS

Custom styles should be defined in scoped component styles:

```vue
<style scoped>
.custom-component {
  /* Component-specific styles */
}
</style>
```

### 10.3 Global Styles

Global styles should be minimal and focus on app-wide concerns:

```css
/* Example of global styles */
:root {
  --base-spacing: 8px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 11. Dark Mode

The application supports both light and dark modes, with automatic switching based on user preference:

```js
// Toggle theme
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  vuetifyTheme.global.name.value = theme.value;
  localStorage.setItem('theme', theme.value);
};
```

Key dark mode considerations:
- Background colors darken
- Text colors lighten
- Elevation becomes more important as differentiator
- Maintain sufficient contrast for all elements

## 12. Responsive Design

### 12.1 Mobile First Approach

- Design for mobile first, then enhance for larger screens
- Use Vuetify's responsive grid system consistently
- Ensure touch targets are at least 48x48px on mobile

### 12.2 Common Responsive Patterns

```html
<!-- Responsive grid example -->
<v-row>
  <v-col cols="12" sm="6" md="4" lg="3">
    <!-- Card content -->
  </v-col>
</v-row>

<!-- Responsive text example -->
<h1 class="text-h5 text-sm-h4 text-md-h3">Responsive Heading</h1>
```

## 13. Style Consistency Checklist

Use this checklist to ensure style consistency across the application:

- [ ] Colors follow the defined palette
- [ ] Typography adheres to the type scale
- [ ] Spacing uses multiples of the base unit (8px)
- [ ] Components use consistent elevation levels
- [ ] Icons are from the MDI icon set
- [ ] All interactive elements have proper focus states
- [ ] Responsive designs consider all breakpoints
- [ ] Dark mode is properly implemented
- [ ] CSS classes follow naming conventions
- [ ] Animations use standard timing functions