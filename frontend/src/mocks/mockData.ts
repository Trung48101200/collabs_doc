import type { DocumentModel, DocumentVersion, User } from "../types";

const mockDocumentVersions: DocumentVersion[] = [
  { id: 1, title: "Phiên bản ban đầu", createdAt: "2026-05-24T08:30:00Z" },
  { id: 2, title: "Cập nhật nội dung", createdAt: "2026-05-24T09:15:00Z" }
];

export const mockUsers: User[] = [
  { id: 1, name: "Alice Nguyen", color: "#0ea5e9" },
  { id: 2, name: "Bao Tran", color: "#f97316" },
  { id: 3, name: "Chau Le", color: "#22c55e" }
];

export const mockDocuments: DocumentModel[] = [
  {
    id: 1,
    title: "Kế hoạch phát triển sản phẩm",
    contentText: "Tài liệu này chứa nội dung chính về các bước phát triển, phạm vi và deadline.",
    contentJson: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            {
              type: "text",
              text: "Kế hoạch phát triển sản phẩm"
            }
          ]
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Tài liệu này chứa nội dung chính về các bước phát triển, phạm vi và deadline."
            }
          ]
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [
            {
              type: "text",
              text: "Giai đoạn 1: Nghiên cứu"
            }
          ]
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Phân tích nhu cầu thị trường"
                    }
                  ]
                }
              ]
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Xác định các tính năng chính"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [
            {
              type: "text",
              text: "Giai đoạn 2: Thiết kế"
            }
          ]
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Bạn có thể bắt đầu chỉnh sửa tài liệu này ngay bây giờ. Hãy thử thêm hoặc sửa nội dung để kiểm tra tính năng cộng tác realtime."
            }
          ]
        }
      ]
    },
    contentHtml: "<h2>Kế hoạch phát triển sản phẩm</h2><p>Tài liệu này chứa nội dung chính về các bước phát triển, phạm vi và deadline.</p><h3>Giai đoạn 1: Nghiên cứu</h3><ul><li><p>Phân tích nhu cầu thị trường</p></li><li><p>Xác định các tính năng chính</p></li></ul><h3>Giai đoạn 2: Thiết kế</h3><p>Bạn có thể bắt đầu chỉnh sửa tài liệu này ngay bây giờ. Hãy thử thêm hoặc sửa nội dung để kiểm tra tính năng cộng tác realtime.</p>",
    role: "owner",
    versions: mockDocumentVersions
  },
  {
    id: 2,
    title: "Hướng dẫn sử dụng tính năng realtime",
    contentText: "Khám phá cách hoạt động của realtime collaborative editor và các phím tắt cơ bản.",
    contentJson: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            {
              type: "text",
              text: "Hướng dẫn sử dụng tính năng Realtime"
            }
          ]
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Khám phá cách hoạt động của realtime collaborative editor và các phím tắt cơ bản."
            }
          ]
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [
            {
              type: "text",
              text: "Phím tắt cơ bản"
            }
          ]
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Ctrl + B: In đậm"
                    }
                  ]
                }
              ]
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Ctrl + I: In nghiêng"
                    }
                  ]
                }
              ]
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Ctrl + U: Gạch dưới"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    contentHtml: "<h2>Hướng dẫn sử dụng tính năng Realtime</h2><p>Khám phá cách hoạt động của realtime collaborative editor và các phím tắt cơ bản.</p><h3>Phím tắt cơ bản</h3><ul><li><p>Ctrl + B: In đậm</p></li><li><p>Ctrl + I: In nghiêng</p></li><li><p>Ctrl + U: Gạch dưới</p></li></ul>",
    role: "editor"
  },
  {
    id: 3,
    title: "Báo cáo kiểm thử giao diện",
    contentText: "Trang này chỉ xem được vì user có quyền viewer.",
    contentJson: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            {
              type: "text",
              text: "Báo cáo kiểm thử giao diện"
            }
          ]
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Trang này chỉ xem được vì user có quyền viewer. Bạn không thể chỉnh sửa nội dung trên trang này."
            }
          ]
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Nếu bạn muốn chỉnh sửa, hãy liên hệ với chủ tài liệu để được cấp quyền editor hoặc owner."
            }
          ]
        }
      ]
    },
    contentHtml: "<h2>Báo cáo kiểm thử giao diện</h2><p>Trang này chỉ xem được vì user có quyền viewer. Bạn không thể chỉnh sửa nội dung trên trang này.</p><p>Nếu bạn muốn chỉnh sửa, hãy liên hệ với chủ tài liệu để được cấp quyền editor hoặc owner.</p>",
    role: "viewer"
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listMockDocuments(): Promise<DocumentModel[]> {
  await delay(120);
  return mockDocuments;
}

export async function createMockDocument(title: string, user: User): Promise<DocumentModel> {
  await delay(120);
  const newDocument: DocumentModel = {
    id: Math.max(...mockDocuments.map((doc) => doc.id), 0) + 1,
    title,
    contentText: "",
    contentJson: { type: "doc", content: [{ type: "paragraph" }] },
    contentHtml: "<p></p>",
    role: user.id === 1 ? "owner" : "editor",
    versions: []
  };

  mockDocuments.push(newDocument);
  return newDocument;
}

export async function getMockDocument(id: number): Promise<DocumentModel> {
  await delay(80);
  const document = mockDocuments.find((item) => item.id === id);
  if (!document) {
    throw new Error("Document not found");
  }
  return document;
}
