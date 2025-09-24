# ConfirmModal Usage Examples

## Basic Confirmation Dialog

```tsx
import { ConfirmModal } from '../components/common';

function DeleteButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    console.log('Item deleted');
    setShowConfirm(false);
  };

  return (
    <>
      <Button danger onClick={() => setShowConfirm(true)}>
        Delete Item
      </Button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        mode="danger"
        title="Delete Confirmation"
        subTitle="Are you sure you want to delete this item? This action cannot be undone."
        confirm={{
          title: "Delete",
          danger: true,
          onClick: handleDelete,
        }}
        cancel={{
          title: "Cancel",
          onClick: () => setShowConfirm(false),
        }}
      />
    </>
  );
}
```

## Success Confirmation

```tsx
<ConfirmModal
  isOpen={showSuccess}
  onClose={() => setShowSuccess(false)}
  mode="success"
  title="Success!"
  subTitle="Your changes have been saved successfully."
  confirm={{
    title: "Continue",
    type: "primary",
    onClick: handleContinue,
  }}
/>
```

## Info Dialog

```tsx
<ConfirmModal
  isOpen={showInfo}
  onClose={() => setShowInfo(false)}
  mode="info"
  title="Information"
  subTitle="This feature requires a premium subscription."
  confirm={{
    title: "Upgrade Now",
    type: "primary",
    onClick: handleUpgrade,
  }}
  cancel={{
    title: "Maybe Later",
    onClick: () => setShowInfo(false),
  }}
/>
```

## With Loading State

```tsx
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  setIsDeleting(true);
  try {
    await deleteItem(itemId);
    setShowConfirm(false);
  } catch (error) {
    console.error('Delete failed:', error);
  } finally {
    setIsDeleting(false);
  }
};

<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  mode="danger"
  title="Delete Item"
  subTitle="This action will permanently delete the item."
  confirm={{
    title: "Delete",
    danger: true,
    loading: isDeleting,
    onClick: handleDelete,
  }}
  cancel={{
    title: "Cancel",
    disabled: isDeleting,
    onClick: () => setShowConfirm(false),
  }}
/>
```