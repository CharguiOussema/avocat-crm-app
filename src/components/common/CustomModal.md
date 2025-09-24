# CustomModal Component

A reusable, flexible modal component built on top of HeadlessUI's Dialog component with enhanced TypeScript support and additional features.

## Features

- 🎯 **Reusable** - Can be used across any feature (clients, cases, documents, etc.)
- 📱 **Fully Responsive** - Adapts to all screen sizes (mobile, tablet, desktop)
- 🎨 **Theme Integration** - Uses application's CSS custom properties and design system
- 🌍 **i18n Ready** - Built-in internationalization support
- 📝 **TypeScript** - Full type safety and IntelliSense support
- 🔧 **Flexible Footer** - Custom button configurations with Ant Design buttons
- ♿ **Accessible** - Built on HeadlessUI's accessible foundation
- 🎭 **Smooth Animations** - Tailored animations for different screen sizes
- ⌨️ **Keyboard Support** - ESC key to close, focus management
- 🖱️ **Click Outside** - Optional click outside to close
- 🎪 **Multi-theme Support** - Works with light, dark, blue, green, purple themes

## Usage

### Basic Usage

```tsx
import { CustomModal } from '../components/common';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CustomModal
      isOpen={isOpen}
      close={() => setIsOpen(false)}
      title="My Modal"
    >
      <p>Modal content here</p>
    </CustomModal>
  );
}
```

### With Custom Footer Buttons

```tsx
const footerButtons = [
  {
    key: 'save',
    label: t('ui.save'),
    type: 'primary' as const,
    onClick: handleSave,
    loading: isSaving,
  },
];

<CustomModal
  isOpen={isOpen}
  close={handleClose}
  title={t('modal.title')}
  size="large"
  footerButtons={footerButtons}
>
  <MyForm />
</CustomModal>
```

### Responsive Sizes

```tsx
// Predefined responsive sizes
<CustomModal size="small">      // Mobile: max-w-sm, Tablet: max-w-md
<CustomModal size="medium">     // Mobile: max-w-lg, Tablet: max-w-xl, Desktop: max-w-2xl
<CustomModal size="large">      // Mobile: max-w-xl, Tablet: max-w-2xl, Desktop: max-w-4xl
<CustomModal size="extra-large"> // Mobile: max-w-2xl, Tablet: max-w-4xl, Desktop: max-w-6xl
<CustomModal size="full">       // All screens: 95vw

// Custom responsive width
<CustomModal width="90vw">      // Custom responsive width
<CustomModal width="600px">     // Fixed width (not recommended for mobile)
```

### Mobile-First Responsive Examples

```tsx
// Mobile-optimized form modal
<CustomModal
  isOpen={isOpen}
  close={handleClose}
  title={t('mobile.form.title')}
  size="small"
  footerButtons={[
    {
      key: 'save',
      label: t('ui.save'),
      type: 'primary',
      onClick: handleSave,
    }
  ]}
>
  <MobileOptimizedForm />
</CustomModal>

// Desktop data table modal
<CustomModal
  isOpen={isOpen}
  close={handleClose}
  title={t('desktop.table.title')}
  size="extra-large"
  maxHeight="80vh"
>
  <ResponsiveDataTable />
</CustomModal>
```

### Theme Integration

The CustomModal automatically adapts to your application's theme using CSS custom properties:

```tsx
// Works with all application themes
<CustomModal
  isOpen={isOpen}
  close={handleClose}
  title="Themed Modal"
  // Automatically uses:
  // - --card for background
  // - --card-foreground for text
  // - --border for borders
  // - --muted for secondary backgrounds
  // - --primary, --destructive for semantic colors
>
  <ThemedContent />
</CustomModal>
```

**Available Theme Colors:**
- `bg-card` / `text-card-foreground` - Main content areas
- `bg-muted` / `text-muted-foreground` - Secondary areas
- `border-border` - All borders
- `text-primary` - Primary actions/links
- `text-destructive` - Destructive actions
- `hover:bg-accent` - Interactive hover states

## Responsive Behavior

### Breakpoints
- **Mobile** (`< 640px`): Full-width with minimal padding
- **Tablet** (`640px - 1024px`): Constrained width with medium padding
- **Desktop** (`> 1024px`): Larger max-widths with full padding

### Animations
- **Mobile**: Slide up from bottom
- **Desktop**: Scale and fade

### Button Layout
- **Mobile**: Stacked vertically, full-width buttons
- **Desktop**: Horizontal layout, auto-width buttons

## Props

### CustomModalProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `open` | `boolean` | - | **Required.** Modal visibility state |
| `onClose` | `() => void` | - | **Required.** Callback when modal is closed |
| `children` | `React.ReactNode` | - | **Required.** Modal content |
| `title` | `string` | - | Modal title (i18n key or direct string) |
| `size` | `ModalSize \| number` | `'medium'` | Predefined size or custom width in pixels |
| `footerButtons` | `CustomModalButton[]` | - | Custom footer buttons |
| `showCloseButton` | `boolean` | `true` | Show default close button when footerButtons provided |
| `closeButtonLabel` | `string` | `t('ui.cancel')` | Close button label (i18n key or string) |
| `centered` | `boolean` | `true` | Whether modal should be centered |
| `maskClosable` | `boolean` | `false` | Whether clicking mask closes modal |
| `destroyOnClose` | `boolean` | `true` | Whether modal should destroy content on close |
| `loading` | `boolean` | `false` | Loading state for the entire modal |
| `maxHeight` | `string` | `'90vh'` | Maximum height for modal content |

### CustomModalButton

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | `string` | - | **Required.** Unique button identifier |
| `label` | `string` | - | **Required.** Button text |
| `onClick` | `() => void` | - | **Required.** Button click handler |
| `type` | `'default' \| 'primary' \| 'dashed' \| 'link' \| 'text'` | `'default'` | Button type |
| `danger` | `boolean` | `false` | Danger/destructive button style |
| `loading` | `boolean` | `false` | Button loading state |
| `disabled` | `boolean` | `false` | Button disabled state |
| `htmlType` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |

### ModalSize

```tsx
type ModalSize = 'small' | 'medium' | 'large' | 'extra-large' | 'full';
```

## Examples

### Client Form Modal

```tsx
<CustomModal
  title={mode === 'create' ? t('clients.modal.addTitle') : t('clients.modal.updateTitle')}
  open={isOpen}
  onClose={handleClose}
  size="medium"
  centered
  destroyOnClose
>
  <ClientForm
    mode={mode}
    client={selectedClient}
    onSuccess={handleSuccess}
    onCancel={handleClose}
  />
</CustomModal>
```

### Confirmation Dialog

```tsx
const confirmButtons = [
  {
    key: 'delete',
    label: t('ui.delete'),
    type: 'primary' as const,
    danger: true,
    onClick: handleDelete,
    loading: isDeleting,
  },
];

<CustomModal
  title={t('confirmDelete.title')}
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  size="small"
  footerButtons={confirmButtons}
  showCloseButton={true}
  closeButtonLabel={t('ui.cancel')}
>
  <p>{t('confirmDelete.message', { name: itemName })}</p>
</CustomModal>
```

### Settings Modal

```tsx
<CustomModal
  title={t('settings.title')}
  open={isSettingsOpen}
  onClose={handleCloseSettings}
  size="large"
  maskClosable={true}
  maxHeight="80vh"
>
  <SettingsForm />
</CustomModal>
```

## Migration from Ant Design Modal

Replace your existing Ant Design Modal:

```tsx
// Before
<Modal
  title="My Modal"
  open={isOpen}
  onCancel={handleClose}
  footer={null}
  width={700}
  centered
  destroyOnClose
>
  {content}
</Modal>

// After
<CustomModal
  title="My Modal"
  open={isOpen}
  onClose={handleClose}
  size="medium" // 700px
  centered
  destroyOnClose
>
  {content}
</CustomModal>
```

## Notes

- All Ant Design Modal props are supported through the spread operator
- The component automatically handles responsive design
- Footer buttons are right-aligned with proper spacing
- Loading states disable interaction with the modal
- The component follows the project's i18n patterns