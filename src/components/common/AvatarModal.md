# AvatarModal Component

A responsive, full-screen modal component for viewing avatar images with zoom and download functionality.

## Features

- 🖼️ **Full-Screen Viewing** - Displays avatars in an immersive full-screen modal
- 📱 **Fully Responsive** - Adapts to all screen sizes with mobile-optimized UI
- 🎨 **Theme Integrated** - Uses application's design system with dark overlay
- 🔍 **Zoom Controls** - Interactive zoom in/out with 50% to 300% range
- 💾 **Download Function** - One-click download of avatar images
- ⌨️ **Keyboard Support** - ESC key to close, proper focus management
- 🖱️ **Click Outside** - Close by clicking outside the image
- 🌍 **i18n Ready** - Full internationalization support
- 📝 **TypeScript** - Complete type safety
- ♿ **Accessible** - Proper ARIA labels and screen reader support

## Usage

### Basic Avatar Modal

```tsx
import { AvatarModal } from '../components/common';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const entity = {
    _id: 'user1',
    fullName: 'John Doe',
    avatar: '/path/to/avatar.jpg'
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        View Avatar
      </button>

      <AvatarModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        entity={entity}
      />
    </>
  );
}
```

### Avatar with Automatic Modal

```tsx
import { AvatarWithModal } from '../components/common';

function UserProfile() {
  const user = {
    _id: 'user1',
    fullName: 'John Doe',
    avatar: '/path/to/avatar.jpg'
  };

  return (
    <AvatarWithModal
      entity={user}
      entityType="user"
      size="large"
      showModal={true}
      showZoom={true}
      showDownload={true}
    />
  );
}
```

### Custom Configuration

```tsx
<AvatarModal
  isOpen={isOpen}
  onClose={handleClose}
  entity={entity}
  showDownload={false}  // Hide download button
  showZoom={false}      // Hide zoom controls
  className="custom-avatar-modal"
/>
```

## Responsive Design

### Mobile Behavior (`< 640px`)
- **Header**: Compact layout with smaller text and icons
- **Controls**: Touch-optimized button sizes
- **Image**: Constrained to 90vw width, 70vh height
- **Footer**: Single column instructions

### Desktop Behavior (`> 640px`)
- **Header**: Full-size layout with larger text
- **Controls**: Standard button sizes with hover effects
- **Image**: Maximum screen utilization
- **Footer**: Multi-column instruction layout

### Screen Size Constraints
- **Max Width**: 90vw (viewport width)
- **Max Height**: 70vh (viewport height)
- **Zoom Range**: 50% - 300%
- **Safe Areas**: Respects mobile viewport insets

## Props

### AvatarModalProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isOpen` | `boolean` | - | **Required.** Modal visibility state |
| `onClose` | `() => void` | - | **Required.** Close callback function |
| `entity` | `AvatarEntity` | - | **Required.** Avatar entity with image data |
| `avatarUrl` | `string` | - | Override URL if different from entity.avatar |
| `showDownload` | `boolean` | `true` | Show download button |
| `showZoom` | `boolean` | `true` | Show zoom controls |
| `className` | `string` | - | Additional CSS classes |
| `data-testid` | `string` | - | Testing identifier |

### AvatarEntity Interface

```tsx
interface AvatarEntity {
  _id: string;
  fullName: string;
  avatar: string | null;
}
```

## Accessibility Features

- **Keyboard Navigation**: ESC key closes modal
- **Focus Management**: Proper focus trapping and restoration
- **ARIA Labels**: All interactive elements have descriptive labels
- **Screen Reader**: Semantic HTML structure
- **High Contrast**: Works with all application themes

## Translations

Add these translations to your i18n files:

```json
{
  "avatar": {
    "modal": {
      "viewImage": "View Avatar",
      "zoomIn": "Zoom in",
      "zoomOut": "Zoom out",
      "download": "Download image",
      "loading": "Loading image...",
      "error": {
        "title": "Failed to load image",
        "description": "The image could not be displayed."
      },
      "instructions": {
        "esc": "Press ESC to close",
        "zoom": "Use zoom controls to resize",
        "click": "Click outside to close"
      }
    }
  }
}
```

## Examples

### Client Avatar Modal

```tsx
function ClientProfile({ client }) {
  const [showAvatar, setShowAvatar] = useState(false);

  return (
    <div className="client-profile">
      <AvatarWithModal
        entity={client}
        entityType="client"
        size="large"
        showModal={true}
      />

      <h2>{client.fullName}</h2>
      <p>{client.email}</p>
    </div>
  );
}
```

### Gallery Modal

```tsx
function AvatarGallery({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="avatar-gallery">
      {users.map(user => (
        <Avatar
          key={user._id}
          entity={user}
          entityType="user"
          onClick={() => setSelectedUser(user)}
        />
      ))}

      {selectedUser && (
        <AvatarModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          entity={selectedUser}
          showDownload={true}
          showZoom={true}
        />
      )}
    </div>
  );
}
```

### Error Handling

```tsx
function RobustAvatarModal({ entity }) {
  const [isOpen, setIsOpen] = useState(false);

  // Don't show modal if no avatar
  if (!entity.avatar) {
    return <Avatar entity={entity} entityType="user" />;
  }

  return (
    <>
      <Avatar
        entity={entity}
        entityType="user"
        onClick={() => setIsOpen(true)}
      />

      <AvatarModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        entity={entity}
      />
    </>
  );
}
```

## Performance Considerations

- **Lazy Loading**: Image loading is deferred until modal opens
- **Memory Management**: Proper cleanup of object URLs
- **Hardware Acceleration**: CSS transforms for smooth zoom
- **Efficient Rendering**: Conditional rendering based on state

## Browser Support

- **Modern Browsers**: Full support for all features
- **Mobile Safari**: Optimized viewport handling
- **Touch Devices**: Touch-friendly interface
- **Keyboard Users**: Complete keyboard accessibility