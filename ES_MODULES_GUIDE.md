# ES 모듈(ECMAScript Modules) 설정 가이드 📦

## 개요

이 프로젝트는 **ES 모듈(ECMAScript Modules)**을 사용합니다. `import`와 `export` 문을 사용하여 모듈을 관리합니다.

---

## ✅ 현재 프로젝트 설정 상태

### 1. 브라우저 환경 (클라이언트 사이드)

**`index.html`**:
```html
<script type="module" src="/src/main.tsx"></script>
```

✅ **이미 올바르게 설정되어 있습니다!**

- `type="module"` 속성이 지정되어 있어 브라우저가 파일을 ES 모듈로 파싱합니다.
- Vite가 빌드 시 자동으로 `type="module"`을 추가합니다.

### 2. Node.js 환경 (서버 사이드)

**`package.json`**:
```json
{
  "type": "module",
  ...
}
```

✅ **이미 올바르게 설정되어 있습니다!**

- `"type": "module"`이 설정되어 있어 모든 `.js` 파일이 ES 모듈로 처리됩니다.
- Netlify Functions도 이 설정을 따릅니다.

### 3. TypeScript 설정

**`tsconfig.json`**:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    ...
  }
}
```

✅ **ES 모듈을 사용하도록 설정되어 있습니다!**

---

## 📚 ES 모듈 설정 방법

### 브라우저 환경

HTML에서 `import` 문을 사용하는 JavaScript 파일을 로드할 때는 **반드시** `type="module"`을 지정해야 합니다:

```html
<!-- ❌ 오류 발생: import 문이 있는 경우 -->
<script src="my-script.js"></script>

<!-- ✅ 올바른 방법: type="module" 지정 -->
<script type="module" src="my-module.js"></script>
```

**설명:**
- `type="module"`을 지정하면 브라우저가 파일을 ES 모듈로 파싱합니다.
- `import`와 `export` 문을 사용할 수 있습니다.
- 모듈은 자동으로 strict mode로 실행됩니다.

### Node.js 환경

Node.js에서 ES 모듈을 사용하는 방법은 두 가지입니다:

#### 방법 1: `package.json`에 `"type": "module"` 추가 (권장) ⭐

**`package.json`**:
```json
{
  "name": "my-project",
  "type": "module",
  ...
}
```

**장점:**
- 프로젝트 전체의 모든 `.js` 파일이 ES 모듈로 처리됩니다.
- 별도 설정 없이 `import`/`export`를 사용할 수 있습니다.
- 현재 프로젝트에서 사용 중인 방법입니다.

**주의사항:**
- CommonJS(`require`, `module.exports`)를 사용하는 파일이 있다면 `.cjs` 확장자를 사용해야 합니다.

#### 방법 2: 파일 확장자를 `.mjs`로 변경

**예시:**
```javascript
// my-module.mjs
export function hello() {
  console.log('Hello!');
}
```

**장점:**
- 개별 파일만 ES 모듈로 처리됩니다.
- `package.json` 설정 없이 사용 가능합니다.

**단점:**
- 모든 파일의 확장자를 변경해야 합니다.
- 프로젝트 전체에 일관성이 없을 수 있습니다.

---

## 🔍 현재 프로젝트 구조

### 클라이언트 사이드 (브라우저)

```
index.html
  └─ <script type="module" src="/src/main.tsx"></script>
      └─ src/main.tsx
          └─ import { ... } from './components/...'
```

**처리 과정:**
1. Vite가 TypeScript를 JavaScript로 변환
2. ES 모듈로 번들링
3. 빌드된 파일에 `type="module"` 자동 추가

### 서버 사이드 (Netlify Functions)

```
netlify/functions/
  ├─ chatgpt.ts
  ├─ perplexity.ts
  └─ youtube.ts
```

**처리 과정:**
1. TypeScript 파일 작성 (`import`/`export` 사용)
2. Netlify가 자동으로 빌드 및 배포
3. `package.json`의 `"type": "module"` 설정을 따름

---

## ✅ 확인 체크리스트

현재 프로젝트가 올바르게 설정되어 있는지 확인:

- [x] `package.json`에 `"type": "module"` 설정됨
- [x] `index.html`에 `type="module"` 속성 있음
- [x] `tsconfig.json`에 `"module": "ESNext"` 설정됨
- [x] 모든 소스 파일에서 `import`/`export` 사용 가능
- [x] Netlify Functions에서 `import`/`export` 사용 가능

---

## 🐛 문제 해결

### 문제 1: "Cannot use import statement outside a module"

**원인:**
- 브라우저: `type="module"`이 없음
- Node.js: `package.json`에 `"type": "module"`이 없거나 `.mjs` 확장자가 아님

**해결:**
- 브라우저: HTML의 `<script>` 태그에 `type="module"` 추가
- Node.js: `package.json`에 `"type": "module"` 추가 또는 파일 확장자를 `.mjs`로 변경

### 문제 2: "require is not defined"

**원인:**
- ES 모듈 환경에서 CommonJS의 `require`를 사용하려고 함

**해결:**
- `require` 대신 `import` 사용
- 또는 `.cjs` 확장자를 사용하여 CommonJS로 처리

### 문제 3: Netlify Functions에서 모듈 오류

**원인:**
- `package.json`에 `"type": "module"`이 없거나
- TypeScript 설정이 잘못됨

**해결:**
1. `package.json`에 `"type": "module"` 확인
2. `tsconfig.json`에 `"module": "ESNext"` 확인
3. Netlify 재배포

---

## 📖 참고 자료

- [MDN: ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Node.js: ES Modules](https://nodejs.org/api/esm.html)
- [Vite: ES Modules](https://vitejs.dev/guide/features.html#es-modules-pre-bundling)

---

## 🎯 요약

### 현재 프로젝트 설정 ✅

1. **브라우저**: `index.html`에 `type="module"` 설정됨
2. **Node.js**: `package.json`에 `"type": "module"` 설정됨
3. **TypeScript**: `tsconfig.json`에 ES 모듈 설정됨

### 핵심 포인트

- ✅ **브라우저**: `<script type="module">` 필수
- ✅ **Node.js**: `package.json`에 `"type": "module"` 또는 `.mjs` 확장자
- ✅ **현재 프로젝트**: 모든 설정이 올바르게 되어 있음

이제 `import`와 `export`를 자유롭게 사용할 수 있습니다! 🎉

