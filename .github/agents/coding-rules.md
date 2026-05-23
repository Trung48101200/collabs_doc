# Coding Rules for Collaborative Editor

## Mục tiêu
Tài liệu quy ước code cho dự án hệ thống soạn thảo văn bản cộng tác realtime.

## Quy tắc đặt tên
- Component: `PascalCase`
- Hooks: `useSomething`
- Socket event: `kebab-case`
- API field/key: `camelCase`
- Constants: `UPPER_CASE`

## Luôn sử dụng
- `async` / `await` cho các thao tác bất đồng bộ.
- Optional chaining (`?.`) khi truy cập dữ liệu không chắc chắn.
- Loading state cho các request và tác vụ async.
- Error handling rõ ràng ở UI và backend.
- Typescript interface hoặc type để định nghĩa dữ liệu.
- Hàm nhỏ, mỗi hàm chỉ chịu trách nhiệm một việc.
- Component tái sử dụng, tránh lặp lại UI và logic.

## Không làm
- Không query database trực tiếp trong route.
- Không đặt socket logic trong component UI.
- Không đặt business logic trong controller.

## Cấu trúc tốt
- Giữ controller chỉ điều phối request/response.
- Đặt business logic vào service hoặc module riêng.
- Đặt truy vấn database vào repository hoặc model layer.
- Đặt socket protocol vào layer socket riêng, không trộn vào UI.

## Ví dụ tốt

### Component
```jsx
function DocumentEditor({ documentId }) {
  return <Editor documentId={documentId} />;
}
```

### Hook
```js
function useDocument(documentId) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocument() {
      try {
        const result = await api.getDocument(documentId);
        setDocument(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [documentId]);

  return { document, loading };
}
```

### Socket event
```js
socket.emit('yjs-update', updatePayload);
```

### API field
```ts
interface DocumentPayload {
  documentId: string;
  title: string;
  updatedAt: string;
}
```

### Constants
```ts
const MAX_RETRY = 3;
const SOCKET_EVENT_JOIN_DOCUMENT = 'join-document';
```

## Ví dụ xấu

### Query database trong route
```js
app.get('/documents/:id', async (req, res) => {
  const document = await DocumentModel.findByPk(req.params.id);
  res.json(document);
});
```

### Socket logic trong component UI
```js
function EditorPage() {
  const socket = io();

  useEffect(() => {
    socket.on('document-update', handleUpdate);
    return () => socket.off('document-update', handleUpdate);
  }, []);

  return <Editor />;
}
```

### Business logic trong controller
```js
exports.updateDocument = async (req, res) => {
  const document = await DocumentModel.findByPk(req.params.id);
  document.title = req.body.title;
  await document.save();
  res.json(document);
};
```

## Ghi chú
- Nếu cần mở rộng tính năng, tái sử dụng các module hiện có và giữ cấu trúc rõ ràng.
- Mỗi lần sửa code, ưu tiên readability, maintainability và tránh duplicate logic.
