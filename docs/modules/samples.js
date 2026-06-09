/* ============================================================
   samples.js — Nội dung mẫu cho editor
   ============================================================ */

export const SAMPLE_VI = `# ProxiJSON — soạn JSON từ cú pháp tối giản
# mỗi dòng # là comment, bỏ qua khi xuất

name: Nguyễn Văn An
age: 28
active: true
score: 9.5
avatar: null

address:
  street: 123 Đường Lê Lợi
  district: Quận 1
  city: TP. Hồ Chí Minh
  zip: "70000"

tags:
  - javascript
  - typescript
  - html
  - css

settings:
  theme: dark
  language: vi
  notifications: true
  features: [search, export, sync]

projects:
  -
    id: 1
    name: Dashboard v2
    status: active
    priority: high
    meta: {starred: true, public: false}
  -
    id: 2
    name: API Gateway
    status: review
    priority: medium
    meta: {starred: false, public: true}
`;

export const SAMPLE_EN = `# ProxiJSON — write JSON with minimal syntax
# lines starting with # are comments, ignored on export

name: Alice Johnson
age: 28
active: true
score: 9.5
avatar: null

address:
  street: 123 Main Street
  district: Downtown
  city: New York
  zip: "10001"

tags:
  - javascript
  - typescript
  - html
  - css

settings:
  theme: dark
  language: en
  notifications: true
  features: [search, export, sync]

projects:
  -
    id: 1
    name: Dashboard v2
    status: active
    priority: high
    meta: {starred: true, public: false}
  -
    id: 2
    name: API Gateway
    status: review
    priority: medium
    meta: {starred: false, public: true}
`;

export const SAMPLE = SAMPLE_VI;
